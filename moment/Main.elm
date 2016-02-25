import Signal
import Keyboard
import Mouse
import Graphics.Element as Element exposing (Element, show)
import Color
import Window
import Text
import Graphics.Collage as Collage exposing (Form)

clamp : (Int, Int) -> Int -> Int
clamp (minv, maxv) value = max (min value maxv) minv

weight : Signal Int
weight = 
    let f prev input = clamp (1, 40) (prev + input)
    in Signal.map (.y) Keyboard.arrows |> Signal.foldp f 1


type alias Particle = { weight : Float, position : (Float, Float) }

particle : Signal Particle
particle = 
    let f w p = { weight = w, position = p }
    in Signal.map2 f
       (Signal.map toFloat weight)
       (Signal.map (\(x,y) -> (toFloat x, toFloat y)) Mouse.position)

centredParticle : Signal Particle
centredParticle = Signal.map2 center Window.dimensions particle

particles : Signal (List Particle)
particles = Signal.foldp (::) [] (Signal.sampleOn Mouse.clicks centredParticle)

moment : List Particle -> (Float, Float)
moment particles = 
    let f p (ox, oy) = (ox + p.weight * (fst p.position), oy + p.weight * (snd p.position))
    in List.foldr f (0.0, 0.0) particles


massCenter : List Particle -> (Float, Float)
massCenter particles =
    let (x,y) = moment particles
        mass = List.sum (List.map .weight particles)
    in (x/mass, y/mass)

momentForm : (Float, Float) -> Form
momentForm (x,y) =
    Collage.group [ Collage.circle 10 |> Collage.filled Color.black |> Collage.move (x, y)
                  , Collage.text (Text.fromString "moment") |> Collage.move (x + 10, y - 15) ]

massForm : (Float, Float) -> Form
massForm (x,y) = 
    Collage.group [ Collage.circle 10 |> Collage.filled Color.gray |> Collage.move (x, y)
                  , Collage.text (Text.fromString "centre of mass") |> Collage.move (x + 20, y + 20) ]

particleForm : Particle -> Form
particleForm p =
    Collage.circle (p.weight)
    |> Collage.filled Color.red
    |> Collage.move p.position

centerForm : Form
centerForm = Collage.rect 4 4 |> Collage.filled Color.blue

particleworld : List Particle -> List Form
particleworld ps = massForm (massCenter ps) :: centerForm :: momentForm (moment ps) :: List.map particleForm ps

center : (Int, Int) -> Particle -> Particle
center (w, h) p = { p | position = ((fst p.position) - (toFloat w)/2, (toFloat h)/2 - (snd p.position)) }

canvas : (Int, Int) -> List Particle -> Element
canvas (w, h) particles = Collage.collage w h (particleworld particles)

help : Int -> Element
help weight = Element.container 500 100 Element.topLeft 
    (Element.leftAligned (Text.fromString "Press up arrow to increase weight,\nand down arrow to decrease.\nCurrent weight is " ++ (Text.fromString (toString weight))))

world : Int -> (Int, Int) -> List Particle -> Element
world weight dimensions particles = Element.layers [help weight, canvas dimensions particles]

main : Signal Element
main = Signal.map3 world weight Window.dimensions particles

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const slides = [ 
  // 1920x1080p images
  {
    id: 1,
    title: "Summer Collection",
    description: "Discover our latest summer styles designed for comfort and elegance.",
    cta: "Shop Now",
    image: "/test.webp",
  },
  {
    id: 2,
    title: "New Arrivals",
    description: "Be the first to explore our brand new inventory hitting the shelves today.",
    cta: "View New",
    image: "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 3,
    title: "Exclusive Offers",
    description: "Members get up to 50% off on selected items this weekend only.",
    cta: "Join Now",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000",
  },
]

export default function HeroCarousel () {
  // Autoscroll for images
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true }) // time between each image
  )

  return (
    <div className="mx-auto w-full max-w-8xl px-4 py-6">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop} //Stop on hover
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative w-full h-160 overflow-hidden rounded-lg">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
                  <h2 className="mb-2 text-3xl font-bold">{slide.title}</h2>
                  <p className="mb-6 max-w-md text-sm font-medium opacity-90">
                    {slide.description}
                  </p>
                  <Button variant="secondary">{slide.cta}</Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  )
}

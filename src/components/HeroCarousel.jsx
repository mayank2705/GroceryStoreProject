import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const banners = [
    { id: 1, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&h=400&q=80' },
    { id: 2, image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&h=400&q=80' },
    { id: 3, image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&h=400&q=80' }
];

export default function HeroCarousel() {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

    return (
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
                <div className="flex">
                    {banners.map((banner) => (
                        <div className="flex-[0_0_100%] min-w-0" key={banner.id}>
                            <img 
                                src={banner.image} 
                                alt={`Banner ${banner.id}`} 
                                className="w-full h-40 sm:h-56 md:h-72 object-cover rounded-2xl"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

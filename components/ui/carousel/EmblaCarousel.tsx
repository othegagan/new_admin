'use client';

import type React from 'react';

import useEmblaCarousel from 'embla-carousel-react';
import { NextButton, PrevButton, usePrevNextButtons } from './EmblaCarouselArrowButtons';
import { SelectedSnapDisplay, useSelectedSnapDisplay } from './EmblaCarouselSelectedSnapDisplay';
import './embla.css';

type PropType = {
    slides: any[];
};

const EmblaCarousel: React.FC<PropType> = (props) => {
    const { slides } = props;
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });

    const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);

    const { selectedSnap, snapCount } = useSelectedSnapDisplay(emblaApi);

    return (
        <section className='embla'>
            <div className='overflow-hidden md:rounded-md' ref={emblaRef}>
                <div className='embla__container'>
                    {slides.map((s, index) => (
                        <div className='embla__slide max-h-56 overflow-hidden md:max-h-80 md:rounded-md' key={index}>
                            <img
                                key={index}
                                src={s.imagename}
                                className='h-full w-full min-w-full object-cover md:rounded-md'
                                alt={`vehicle  ${index}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {slides.length > 1 && (
                <div className='-mt-[44px] relative z-10 mb-2 flex items-center justify-between gap-[1.2rem] px-3 text-white'>
                    <SelectedSnapDisplay selectedSnap={selectedSnap} snapCount={snapCount} />

                    <div className='grid grid-cols-2 items-center gap-1'>
                        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
                        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
                    </div>
                </div>
            )}
        </section>
    );
};

export default EmblaCarousel;

export function sortImagesByIsPrimary(images: any[]) {
    if (!Array.isArray(images)) {
        return [];
    }

    return images.slice().sort((a, b) => {
        // Sort records with isPrimary true first
        if (a.isPrimary && !b.isPrimary) {
            return -1;
        }
        if (!a.isPrimary && b.isPrimary) {
            return 1;
        }
        // For records with the same isPrimary value, maintain their original order
        return a.orderNumber - b.orderNumber;
    });
}

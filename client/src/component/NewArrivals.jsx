import React, { useState } from 'react';
import arrow_l from '../res/icons/arrow_l.png';
import arrow_r from '../res/icons/arrow_r.png';

const NewArrivals = () => {
    // Стан для поточного індексу показаних товарів
    const [currentIndex, setCurrentIndex] = useState(0);

    // Масив товарів (12 товарів з ціною та зображенням)
    const products = [
        { id: 1, name: 'Товар 1', price: '300 грн', image: 'https://img2.ans-media.com/i/542x813/AW24-OBM0KD-89X_F1.webp?v=1727338485' },
        { id: 2, name: 'Товар 2', price: '500 грн', image: 'https://img2.ans-media.com/i/462x693/AW24-KUM134-80X_F1.webp?v=1726161381' },
        { id: 3, name: 'Товар 3', price: '150 грн', image: 'https://img2.ans-media.com/i/462x693/SS25-SWM01A-01X_F1.webp?v=1732616692' },
        { id: 4, name: 'Товар 4', price: '200 грн', image: 'https://img2.ans-media.com/i/462x693/AW24-KUM09A-89X_F1.webp?v=1728466811' },
        { id: 5, name: 'Товар 5', price: '400 грн', image: 'https://img2.ans-media.com/i/462x693/AW24-SWM04N-80X_F1.webp?v=1733820997' },
        { id: 6, name: 'Товар 6', price: '250 грн', image: 'https://placehold.co/300x300' },
        { id: 7, name: 'Товар 7', price: '350 грн', image: 'https://placehold.co/300x300' },
        { id: 8, name: 'Товар 8', price: '450 грн', image: 'https://placehold.co/300x300' },
        { id: 9, name: 'Товар 9', price: '600 грн', image: 'https://placehold.co/300x300' },
        { id: 10, name: 'Товар 10', price: '700 грн', image: 'https://placehold.co/300x300' },
        { id: 11, name: 'Товар 11', price: '550 грн', image: 'https://placehold.co/300x300' },
        { id: 12, name: 'Товар 12', price: '250 грн', image: 'https://placehold.co/300x300' },
    ];

    // Кількість товарів, які будуть відображатись в області перегляду
    const itemsToShow = 5; // Кількість товарів, які відображаються в один момент

    // Функція для прокручування вліво
    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - itemsToShow : prevIndex));
    };

    // Функція для прокручування вправо
    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex + itemsToShow < products.length ? prevIndex + itemsToShow : prevIndex
        );
    };

    return (
        <section className="relative max-w-screen-2xl mx-auto py-8">
            <h2 className="text-3xl font-semibold mb-6 text-center">Новинки</h2>

            {/* Контейнер товарів */}
            <div className="overflow-hidden">
                <div
                    className="flex transition-transform duration-500"
                    style={{
                        transform: `translateX(-${(currentIndex * 100) / itemsToShow}%)`,
                    }}
                >
                    {products.map((product) => (
                        <div key={product.id} className="flex-none w-[calc(20%)] p-4">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain" // Змінив на object-contain
                                />
                                <div className="p-4">
                                    <p className="text-lg font-semibold">{product.name}</p>
                                    <p className="text-gray-500">{product.price}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Кнопки для прокручування */}
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 pl-4">
                <button
                    onClick={handlePrev}
                    className="bg-transparent"
                >
                    <img
                        src={arrow_l}
                        alt="left-pointer"
                        className="w-7 h-7 opacity-50 hover:opacity-100 transition-opacity duration-300"
                    />
                </button>
            </div>

            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 pr-4">
                <button
                    onClick={handleNext}
                    className="bg-transparent"
                >
                    <img
                        src={arrow_r}
                        alt="right-pointer"
                        className="w-7 h-7 opacity-50 hover:opacity-100 transition-opacity duration-300"
                    />
                </button>
            </div>
        </section>
    );
};

export default NewArrivals;

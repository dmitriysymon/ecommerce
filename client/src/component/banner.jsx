import React from 'react';

const Banner = () => {
  return (
    <section className="max-w-screen-2xl mx-auto mt-28 overflow-hidden">
      <img
        src="https://placehold.co/1800x600" // Замість цього URL поставте своє зображення
        alt="Banner"
        className="w-full h-full object-cover" // Зробить зображення фоновим, обрізаючи його при необхідності
      />
    </section>
  );
};

export default Banner;
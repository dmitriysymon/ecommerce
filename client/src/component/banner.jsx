import React from 'react';

const Banner = () => {
  return (
    <section className="max-w-screen-2xl mx-auto p-4 mt-2 px-0 sm:mt-4 md:mt-4 lg:mt-10 overflow-hidden sm:px-0 md:px-0 lg:px-2">
      <img
      draggable="false"
        src="https://placehold.co/1800x600" // Замість цього URL поставте своє зображення
        alt="Banner"
        className="w-full h-auto sm:h-full object-cover"
      />
    </section>
  );
};

export default Banner;

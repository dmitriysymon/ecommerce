import React from "react";

const Banner = () => {
  return (
    <section className="w-full overflow-hidden px-0">
      <div className="flex justify-start">
        <img
          draggable="false"
          src="https://static.housebrand.com/media/SHARED/stronywizerunkowe/house/homepage-new/images/slider/D/UA-d-home-promo-20250218.jpg"
          alt="Banner"
          className="min-w-[600px] md:min-w-[1000px] lg:min-w-[2000px] max-w-full h-auto object-cover"
        />
      </div>
    </section>
  );
};

export default Banner;

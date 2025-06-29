import React from "react";
import { useBaseUrl } from "../context/BaseUrlContext";

const Banner = () => {
  const baseUrl = useBaseUrl();
  return (
    <section className="w-full overflow-hidden px-0 mt-[50px]">
      <div className="flex justify-center overflow-hidden w-full">
        <img
          draggable="false"
          src={`${baseUrl}/uploads/banner.png`}
          alt="Banner"
          className="w-full max-w-none h-auto object-cover object-center min-w-[700px] md:min-w-[1000px] lg:min-w-[2000px]"
          style={{ maxWidth: "none" }}
        />
      </div>
    </section>
  );
};

export default Banner;

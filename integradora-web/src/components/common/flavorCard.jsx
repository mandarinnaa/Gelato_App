import React from 'react';

const FlavorCard = ({ flavor, imagePosition = 'left', onOrder, onLearnMore }) => {
  // imagePosition puede ser 'left' o 'right'
  const isImageLeft = imagePosition === 'left';

  return (
    <div
      className="relative flex items-center justify-center group"
      style={{
        height: '450px',
        minHeight: '450px',
        maxHeight: '450px',
        '--card-hover-color': flavor.hoverColor // Variable CSS para el color dinámico
      }}
    >
      {/* Imagen */}
      <div
        className={`absolute ${isImageLeft ? (flavor.imagePositionH || 'left-0 md:left-10 lg:left-3') : (flavor.imagePositionH || 'right-0 md:right-10 lg:right-3')} ${flavor.imagePositionV || 'top-1/2 -translate-y-1/2'} z-20 pointer-events-none`}
      >
        <div className={flavor.imageSize || "w-[280px] md:w-[350px] lg:w-[420px]"}>
          <img
            src={flavor.image}
            alt={flavor.name}
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-7xl ${isImageLeft ? 'ml-auto' : 'mr-auto'} rounded-[50px] transition-colors duration-500 ease-in-out cursor-pointer overflow-hidden`}
        style={{
          backgroundColor: 'white',
          height: '450px',
          minHeight: '450px',
          maxHeight: '450px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = flavor.hoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
        }}
      >
        <div
          className="flex items-center"
          style={{
            height: '450px',
            minHeight: '450px',
            maxHeight: '450px'
          }}
        >
          {/* Espacio vacío para la imagen - se invierte el orden */}
          {isImageLeft && (
            <div
              className="w-2/5 md:w-5/12"
              style={{
                flexShrink: 0,
                height: '450px'
              }}
            ></div>
          )}

          {/* Contenido */}
          <div
            className="w-3/5 md:w-7/12 p-6 md:p-10 lg:p-12 flex flex-col justify-between"
            style={{
              height: '450px',
              minHeight: '450px',
              maxHeight: '450px'
            }}
          >
            {/* Título y descripción */}
            <div className="flex-1 flex flex-col justify-center">
              <h3
                className="font-extrabold text-black group-hover:text-white leading-tight transition-colors duration-300 uppercase"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)', // Más grande
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {flavor.name}
              </h3>
              <p
                className="text-black group-hover:text-white leading-relaxed transition-colors duration-300"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 'clamp(1rem, 1.8vw, 1.3rem)', // Más grande
                  fontWeight: 500,
                  marginBottom: '2rem',
                  display: '-webkit-box',
                  WebkitLineClamp: '3',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {flavor.description}
              </p>

              {/* Botones */}
              <div className="flex flex-row gap-4 items-center" style={{ flexShrink: 0 }}>
                <button
                  onClick={onLearnMore}
                  className="bg-transparent text-black font-bold text-lg transition-all duration-500 ease-in-out group-hover:px-8 group-hover:py-3 group-hover:border-2 group-hover:border-white group-hover:text-white group-hover:rounded-full"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Saber Más
                </button>
                <button
                  onClick={onOrder}
                  className="bg-transparent text-black font-bold text-lg transition-all duration-500 ease-in-out group-hover:px-8 group-hover:py-3 group-hover:border-2 group-hover:border-white group-hover:bg-white group-hover:text-[var(--card-hover-color)] group-hover:rounded-full"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Ordenar
                </button>
              </div>
            </div>
          </div>

          {/* Espacio vacío para la imagen a la derecha */}
          {!isImageLeft && (
            <div
              className="w-2/5 md:w-5/12"
              style={{
                flexShrink: 0,
                height: '450px'
              }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlavorCard;
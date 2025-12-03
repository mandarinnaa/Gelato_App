import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const navigate = useNavigate();
  const [activeValue, setActiveValue] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});

  const statsRef = useRef(null);
  const missionRef = useRef(null);
  const valuesRef = useRef(null);
  const customRef = useRef(null);
  const locationRef = useRef(null);

  // Iconos SVG personalizados
  const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );

  const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );

  const AwardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
    </svg>
  );

  const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );

  // Cargar fuentes de Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Intersection Observer para animaciones de scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    const sections = [statsRef, missionRef, valuesRef, customRef, locationRef];
    sections.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  const values = [
    {
      icon: HeartIcon,
      title: "Pasión",
      description: "Cada pastel es creado con amor y dedicación, usando solo los mejores ingredientes.",
      color: "#E53935"
    },
    {
      icon: AwardIcon,
      title: "Calidad",
      description: "Nos comprometemos a ofrecer productos de la más alta calidad en cada bocado.",
      color: "#000000"
    },
    {
      icon: UsersIcon,
      title: "Comunidad",
      description: "Somos parte de tu familia, celebrando contigo los momentos más especiales.",
      color: "#E53935"
    }
  ];

  const stats = [
    { number: "15+", label: "Años de Experiencia" },
    { number: "50K+", label: "Pasteles Vendidos" },
    { number: "100%", label: "Satisfacción Cliente" },
    { number: "25+", label: "Sabores Únicos" }
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Contenido de texto */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Conoce
              </p>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-black mb-6 leading-tight">
                Nuestra Historia
              </h1>

              <p className="text-lg font-medium text-gray-600 mb-2">
                Desde 2009
              </p>

              <p className="text-base text-gray-700 leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
                Somos una pastelería tradicional que ha endulzado la vida de miles de familias durante más de 15 años, combinando recetas artesanales con los mejores ingredientes.
              </p>

              <button
                onClick={() => navigate('/shop')}
                className="px-8 py-3.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg uppercase tracking-wide text-sm"
              >
                Ver Productos
              </button>
            </div>

            {/* Imagen */}
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <img
                src="https://www.juniorscheesecake.com/cdn/shop/files/7in-Red-Velvet-Cheesecake-slice.webp?v=1720628516&width=823"
                alt="Nuestros pasteles"
                className="w-full max-w-md h-auto object-contain drop-shadow-2xl transform transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        id="stats"
        className={`py-16 px-4 md:px-8 bg-white border-y border-gray-200 transition-all duration-1000 ${visibleSections.stats
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center transform transition-all duration-500 hover:scale-110"
                style={{
                  transitionDelay: visibleSections.stats ? `${index * 100}ms` : '0ms',
                  opacity: visibleSections.stats ? 1 : 0,
                  transform: visibleSections.stats ? 'translateY(0)' : 'translateY(30px)'
                }}
              >
                <h3 className="text-4xl md:text-5xl font-black text-black mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section
        ref={missionRef}
        id="mission"
        className={`py-20 px-4 md:px-8 bg-gray-50 transition-all duration-1000 ${visibleSections.mission
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-1000 delay-200 ${visibleSections.mission
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-10'
              }`}>
              <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
                Nuestra Misión
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 text-base leading-relaxed">
                  Crear momentos inolvidables a través de pasteles excepcionales que deleitan los sentidos y alegran el corazón.
                </p>
                <p className="text-gray-700 text-base leading-relaxed">
                  Cada creación es una obra de arte comestible diseñada para hacer de tus celebraciones algo verdaderamente especial.
                </p>
                <p className="text-gray-700 text-base leading-relaxed">
                  Ya sea que elijas uno de nuestros pasteles tradicionales o personalices tu propio diseño único, garantizamos calidad premium y sabor inigualable en cada bocado.
                </p>
              </div>
            </div>

            <div className={`relative flex items-center justify-center transition-all duration-1000 delay-400 ${visibleSections.mission
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-10'
              }`}>
              <img
                src="https://www.juniorscheesecake.com/cdn/shop/files/8in-Strawberry-Shortcake-Cheesecake_slice.webp?v=1721232707&width=823"
                alt="Misión"
                className="w-full max-w-md h-auto object-contain transform transition-transform duration-500 hover:scale-105 rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section
        ref={valuesRef}
        id="values"
        className={`py-20 px-4 md:px-8 bg-white transition-all duration-1000 ${visibleSections.values
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-black text-center mb-16">
            Nuestros Valores
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-8 text-center transition-all duration-500 hover:shadow-lg hover:-translate-y-2"
                  style={{
                    transitionDelay: visibleSections.values ? `${index * 150}ms` : '0ms',
                    opacity: visibleSections.values ? 1 : 0,
                    transform: visibleSections.values ? 'translateY(0)' : 'translateY(30px)'
                  }}
                  onMouseEnter={() => setActiveValue(index)}
                  onMouseLeave={() => setActiveValue(-1)}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-300 transform hover:scale-110"
                    style={{
                      backgroundColor: activeValue === index ? value.color : 'transparent',
                      border: `2px solid ${value.color}`
                    }}
                  >
                    <div style={{
                      color: activeValue === index ? '#fff' : value.color,
                      transition: 'color 0.3s'
                    }}>
                      <Icon />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section
        ref={customRef}
        id="custom"
        className={`py-20 px-4 md:px-8 bg-gray-50 transition-all duration-1000 ${visibleSections.custom
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`relative flex items-center justify-center order-2 md:order-1 transition-all duration-1000 delay-200 ${visibleSections.custom
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-10'
              }`}>
              <img
                src="https://www.juniorscheesecake.com/cdn/shop/files/7in-Chocolate-Mousse-Cheesecake-slice.webp?v=1720718023&width=823"
                alt="Personalización"
                className="w-full max-w-md h-auto object-contain transform transition-transform duration-500 hover:scale-105 rounded-lg"
              />
            </div>

            <div className={`order-1 md:order-2 transition-all duration-1000 delay-400 ${visibleSections.custom
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-10'
              }`}>
              <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
                Personaliza Tu Pastel
              </h2>
              <p className="text-gray-700 text-base mb-6 leading-relaxed">
                ¿Tienes una visión especial? Nuestro sistema de personalización te permite crear el pastel perfecto eligiendo entre:
              </p>
              <div className="space-y-3 mb-8">
                {['Más de 25 sabores únicos', 'Rellenos artesanales', 'Diferentes tamaños', 'Toppings premium', 'Decoraciones personalizadas'].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center text-gray-700 text-base group transition-all duration-300 hover:translate-x-2"
                  >
                    <span className="w-2 h-2 bg-black rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></span>
                    {item}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/custom-cake')}
                className="px-8 py-3.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg uppercase tracking-wide text-sm"
              >
                Crear Mi Pastel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section
        ref={locationRef}
        id="location"
        className={`py-20 px-4 md:px-8 bg-white transition-all duration-1000 ${visibleSections.location
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-black text-center mb-4">
            Visítanos
          </h2>
          <p className="text-center text-gray-600 text-base mb-12">
            Te esperamos en nuestra pastelería
          </p>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Información de contacto */}
            <div className={`space-y-8 transition-all duration-1000 delay-200 ${visibleSections.location
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-10'
              }`}>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start group cursor-pointer">
                  <div className="text-black mr-4 flex-shrink-0 mt-1 transition-transform duration-300 group-hover:scale-110">
                    <MapPinIcon />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black mb-2">
                      Dirección
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Reforma 100-altos, Colonia Centro, Papantla
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-bold text-black mb-4">
                  Horario
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Lunes a Sábado:</span> 9:00 AM - 8:00 PM
                  </p>
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Domingo:</span> 10:00 AM - 6:00 PM
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-bold text-black mb-4">
                  Contacto
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-700 text-sm hover:text-black transition-colors duration-300 cursor-pointer">
                    <span className="font-semibold">Teléfono:</span> (+52) 784 135 3775
                  </p>
                  <p className="text-gray-700 text-sm hover:text-black transition-colors duration-300 cursor-pointer">
                    <span className="font-semibold">Email:</span> info@pasteleria.com
                  </p>
                </div>
              </div>
            </div>

            {/* Mapa de Google */}
            <div className={`rounded-lg overflow-hidden h-[450px] border border-gray-200 shadow-sm transition-all duration-1000 delay-400 hover:shadow-lg ${visibleSections.location
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-10'
              }`}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.8!2d-97.3226709848484!3d20.446573895133334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDI2JzQ3LjciTiA5N8KwMTknMjEuNiJX!5e0!3m2!1ses!2smx!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de la pastelería"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
            ¿Listo para endulzar tu día?
          </h2>
          <p className="text-gray-700 text-lg mb-10">
            Descubre nuestros pasteles o crea tu propio diseño único
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3.5 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg uppercase tracking-wide text-sm"
              style={{ backgroundColor: '#E53935' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c62828'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E53935'}
            >
              Ver Productos
            </button>
            <button
              onClick={() => navigate('/custom-cake')}
              className="px-8 py-3.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg uppercase tracking-wide text-sm"
            >
              Personalizar Pastel
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
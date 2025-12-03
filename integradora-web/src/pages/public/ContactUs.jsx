import React, { useEffect, useState, useRef } from 'react';
import { contactService } from '../../api/contactService';

const ContactUs = () => {
  const [visibleSections, setVisibleSections] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // success | error

  const formRef = useRef(null);

  // SVG Icons
  const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );

  const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );

  const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );

  const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );

  // Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    if (formRef.current) observer.observe(formRef.current);

    return () => observer.disconnect();
  }, []);

  // Inputs
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      const response = await contactService.sendContactForm(formData);

      if (response.success) {
        setSubmitStatus('success');

        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });

        setTimeout(() => setSubmitStatus(null), 5000);
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: "Teléfono",
      details: ["(784) 135-3775"],
      color: "#000000"
    },
    {
      icon: MailIcon,
      title: "Email",
      details: ["gelatopasteleria@gmail.com"],
      color: "#000000"
    },
    {
      icon: MapPinIcon,
      title: "Dirección",
      details: ["Papantla, Veracruz"],
      color: "#000000"
    },
    {
      icon: ClockIcon,
      title: "Horario",
      details: ["Lun - Sáb: 8:00 - 20:00", "Domingo: Cerrado"],
      color: "#000000"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* HERO */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-12">

            {/* TEXTO */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Estamos aquí
              </p>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-black mb-6 leading-tight">
                Contáctanos
              </h1>

              <p className="text-lg font-medium text-gray-600 mb-2">
                Para Ti
              </p>

              <p className="text-base text-gray-700 leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
                ¿Tienes alguna pregunta o quieres hacer un pedido especial? Nos encantaría escucharte.
                Completa el formulario o contáctanos directamente.
              </p>
            </div>

            {/* IMAGEN */}
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <img
                src="https://www.juniorscheesecake.com/cdn/shop/files/10in-Best-Of-Juniors-XL-Sampler_BrownieExplosion_slice.webp?v=1721681650&width=823"
                alt="Contáctanos"
                className="w-full max-w-md h-auto object-contain drop-shadow-2xl transform transition-transform duration-500 hover:scale-105"
              />
            </div>

          </div>
        </div>
      </section>

      {/* FORMULARIO Y CONTACTO */}
      <section
        ref={formRef}
        id="form"
        className={`py-20 px-4 md:px-8 bg-white transition-all duration-1000 ${visibleSections.form ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">

            {/* FORM */}
            <div
              className={`transition-all duration-1000 delay-200 ${visibleSections.form
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-10'
                }`}
            >
              <h2 className="text-3xl md:text-4xl font-black text-black mb-8">
                Envíanos un Mensaje
              </h2>

              <div className="space-y-6">

                {/* SUCESS & ERROR ALERTS */}
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-green-800">¡Mensaje enviado exitosamente!</p>
                      <p className="text-sm text-green-700 mt-1">Te responderemos pronto.</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-red-800">Error al enviar el mensaje</p>
                      <p className="text-sm text-red-700 mt-1">Por favor intenta de nuevo.</p>
                    </div>
                  </div>
                )}

                {/* CAMPOS */}

                <div>
                  <label className="block text-black text-xs font-bold mb-2 uppercase tracking-wider">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
                    focus:border-black focus:ring-0 focus:outline-none transition-colors duration-300 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-black text-xs font-bold mb-2 uppercase tracking-wider">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg 
                      focus:border-black focus:ring-0 focus:outline-none transition-colors duration-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-black text-xs font-bold mb-2 uppercase tracking-wider">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                      focus:border-black focus:ring-0 focus:outline-none transition-colors duration-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-black text-xs font-bold mb-2 uppercase tracking-wider">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                    focus:border-black focus:ring-0 focus:outline-none transition-colors duration-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-black text-xs font-bold mb-2 uppercase tracking-wider">
                    Mensaje *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                    focus:border-black focus:ring-0 focus:outline-none transition-colors duration-300 resize-none text-sm"
                  ></textarea>
                </div>

                {/* BOTÓN ACTUALIZADO */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-black text-white px-8 py-4 rounded-full font-bold text-sm
                  transition-all duration-300 hover:bg-gray-800 transform hover:scale-105 shadow-lg uppercase tracking-wide
                  w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
            </div>

            {/* CONTACT INFO */}
            <div
              className={`transition-all duration-1000 delay-400 ${visibleSections.form
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-10'
                }`}
            >
              <h2 className="text-3xl md:text-4xl font-black text-black mb-8">
                Información de Contacto
              </h2>

              <div className="space-y-6 mb-12">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start group cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                    >
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-gray-100 text-black transition-transform duration-300 group-hover:scale-110"
                      >
                        <Icon />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-black mb-1 uppercase tracking-wide">
                          {info.title}
                        </h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600 text-sm">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg overflow-hidden h-[300px] border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.8!2d-97.3226709848484!3d20.446573895133334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDI2JzQ3LjciTiA5N8KwMTknMjEuNiJX!5e0!3m2!1ses!2smx!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen=""
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;

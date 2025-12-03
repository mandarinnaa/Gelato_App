import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { customProductService } from '../../api/customProductService';

const CustomProductBuilder = ({ isOpen, onClose, onAddToCart }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Opciones disponibles
  const [options, setOptions] = useState({
    flavors: [],
    sizes: [],
    fillings: [],
    toppings: [],
  });

  // Selecciones del usuario
  const [selections, setSelections] = useState({
    flavor_id: null,
    size_id: null,
    filling_id: null,
    toppings: [],
    quantity: 1,
  });

  const [calculatedPrice, setCalculatedPrice] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  // Calcular precio cuando cambian las selecciones relevantes
  useEffect(() => {
    if (selections.flavor_id && selections.size_id) {
      calculatePrice();
    } else {
      setCalculatedPrice(null);
    }
  }, [selections.flavor_id, selections.size_id, selections.filling_id, selections.toppings]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const data = await customProductService.getCustomizationOptions();
      setOptions(data);
      setError('');
    } catch (err) {
      console.error('Error cargando opciones:', err);
      setError('Error al cargar las opciones de personalización');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    if (!selections.flavor_id || !selections.size_id) return;

    try {
      setCalculating(true);
      const data = await customProductService.calculatePrice({
        flavor_id: selections.flavor_id,
        size_id: selections.size_id,
        filling_id: selections.filling_id || null,
        toppings: selections.toppings,
      });

      if (data.success) {
        setCalculatedPrice(data.data.final_price);
        setError('');
      } else {
        setCalculatedPrice(null);
        setError(data.message || 'Combinación no disponible');
      }
    } catch (err) {
      console.error('Error calculando precio:', err);
      setCalculatedPrice(null);
      setError('Esta combinación de sabor y tamaño no está disponible');
    } finally {
      setCalculating(false);
    }
  };

  // Obtener el precio base para un tamaño específico según el sabor seleccionado
  const getPriceForSize = (sizeId) => {
    const selectedFlavor = options.flavors.find(f => f.id === selections.flavor_id);
    if (selectedFlavor?.prices && selectedFlavor.prices[sizeId]) {
      return parseFloat(selectedFlavor.prices[sizeId]);
    }
    return null;
  };

  // Verificar si un tamaño está disponible para el sabor seleccionado
  const isSizeAvailable = (sizeId) => {
    return getPriceForSize(sizeId) !== null;
  };

  const handleToggleTopping = (toppingId) => {
    setSelections(prev => ({
      ...prev,
      toppings: prev.toppings.includes(toppingId)
        ? prev.toppings.filter(id => id !== toppingId)
        : [...prev.toppings, toppingId]
    }));
  };

  const handleNext = () => {
    if (step === 1 && !selections.flavor_id) {
      setError('Por favor selecciona un sabor');
      return;
    }
    if (step === 2 && !selections.size_id) {
      setError('Por favor selecciona un tamaño');
      return;
    }
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleAddToCart = async () => {
    if (!selections.flavor_id || !selections.size_id) {
      setError('Completa todos los pasos requeridos');
      return;
    }

    if (!calculatedPrice) {
      setError('No se pudo calcular el precio. Verifica tu selección.');
      return;
    }

    try {
      setLoading(true);
      await onAddToCart({
        ...selections,
        final_price: calculatedPrice,
      });
      setIsSuccess(true);
    } catch (err) {
      setError('Error al agregar al carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelections({
      flavor_id: null,
      size_id: null,
      filling_id: null,
      toppings: [],
      quantity: 1,
    });
    setCalculatedPrice(null);
    setError('');
    setIsSuccess(false);
    onClose();
  };

  const handleCreateAnother = () => {
    setStep(1);
    setSelections({
      flavor_id: null,
      size_id: null,
      filling_id: null,
      toppings: [],
      quantity: 1,
    });
    setCalculatedPrice(null);
    setError('');
    setIsSuccess(false);
  };

  // Al cambiar sabor, resetear tamaño si ya no está disponible
  const handleFlavorSelect = (flavorId) => {
    setSelections(prev => {
      const newSelections = { ...prev, flavor_id: flavorId };
      // Si había un tamaño seleccionado, verificar si sigue disponible
      if (prev.size_id) {
        const flavor = options.flavors.find(f => f.id === flavorId);
        if (!flavor?.prices?.[prev.size_id]) {
          newSelections.size_id = null;
        }
      }
      return newSelections;
    });
  };

  const getSelectedFlavor = () => options.flavors.find(f => f.id === selections.flavor_id);
  const getSelectedSize = () => options.sizes.find(s => s.id === selections.size_id);
  const getSelectedFilling = () => options.fillings.find(f => f.id === selections.filling_id);
  const getSelectedToppings = () => options.toppings.filter(t => selections.toppings.includes(t.id));

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
      {[1, 2, 3, 4].map((num) => (
        <React.Fragment key={num}>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full font-black text-lg border-2 transition-all duration-300 ${step >= num
            ? 'bg-black text-white border-black scale-110'
            : 'bg-white text-gray-400 border-gray-200'
            }`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {num}
          </div>
          {num < 4 && (
            <div className={`w-16 h-1 mx-2 transition-all duration-500 ${step > num ? 'bg-black' : 'bg-gray-200'
              }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="animate-fade-in">
      <h3 className="text-2xl font-black text-black mb-6 uppercase text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        Paso 1: Elige tu sabor
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.flavors.filter(f => f.available !== false).map(flavor => (
          <button
            key={flavor.id}
            onClick={() => handleFlavorSelect(flavor.id)}
            className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${selections.flavor_id === flavor.id
              ? 'border-black bg-[#E8F442] text-black scale-[1.02]'
              : 'border-gray-200 hover:border-black bg-white text-black'
              }`}
          >
            <div className="font-black text-lg mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{flavor.name}</div>
            {flavor.description && (
              <div className="text-sm font-medium opacity-80">{flavor.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => {
    const selectedFlavor = getSelectedFlavor();

    const portionsMap = {
      'Chico': '5 porciones',
      'Mediano': '10 porciones',
      'Grande': '15 porciones'
    };

    return (
      <div className="animate-fade-in">
        <h3 className="text-2xl font-black text-black mb-2 uppercase text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Paso 2: Elige el tamaño
        </h3>
        {selectedFlavor && (
          <p className="text-center text-gray-500 mb-8 font-medium">
            Precios para sabor: <span className="font-bold text-black">{selectedFlavor.name}</span>
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {options.sizes.map(size => {
            const price = getPriceForSize(size.id);
            const available = price !== null;

            return (
              <button
                key={size.id}
                onClick={() => available && setSelections(prev => ({ ...prev, size_id: size.id }))}
                disabled={!available}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${!available
                  ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                  : selections.size_id === size.id
                    ? 'border-black bg-[#F4D4F4] text-black scale-[1.02] shadow-lg'
                    : 'border-gray-200 hover:border-black bg-white hover:shadow-md'
                  }`}
              >
                <div className="text-center">
                  <div className={`font-black text-lg mb-1 ${available ? 'text-black' : 'text-gray-400'}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {size.name}
                  </div>
                  <div className="text-sm font-bold text-gray-500 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {portionsMap[size.name] || ''}
                  </div>
                  {size.description && (
                    <div className="text-xs font-medium text-gray-500 mb-3">{size.description}</div>
                  )}
                  <div className={`text-xl font-black ${available ? 'text-black' : 'text-gray-400'
                    }`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {available ? `$${price.toFixed(2)}` : 'No disponible'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mostrar mensaje si no hay precios */}
        {options.sizes.every(s => !isSizeAvailable(s.id)) && (
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
            <p className="font-bold text-yellow-800">
              ⚠️ No hay precios configurados para este sabor.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="animate-fade-in">
      <h3 className="text-2xl font-black text-black mb-6 uppercase text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        Paso 3: Elige el relleno (opcional)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setSelections(prev => ({ ...prev, filling_id: null }))}
          className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${!selections.filling_id
            ? 'border-black bg-black text-white scale-[1.02]'
            : 'border-gray-200 hover:border-black bg-white text-black'
            }`}
        >
          <div className="font-black text-lg mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>Sin relleno</div>
          <div className="text-sm font-medium opacity-80">Pastel tradicional</div>
        </button>
        {options.fillings.map(filling => (
          <button
            key={filling.id}
            onClick={() => setSelections(prev => ({ ...prev, filling_id: filling.id }))}
            className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg ${selections.filling_id === filling.id
              ? 'border-black bg-[#E8F442] text-black scale-[1.02]'
              : 'border-gray-200 hover:border-black bg-white text-black'
              }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-black text-lg mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>{filling.name}</div>
                {filling.description && (
                  <div className="text-sm font-medium opacity-80">{filling.description}</div>
                )}
              </div>
              {filling.extra_price > 0 && (
                <div className="text-sm font-bold bg-white/50 px-2 py-1 rounded-lg">
                  +${parseFloat(filling.extra_price).toFixed(2)}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => {
    const basePrice = getPriceForSize(selections.size_id) || 0;

    return (
      <div className="animate-fade-in">
        <h3 className="text-2xl font-black text-black mb-6 uppercase text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Paso 4: Agrega toppings (opcional)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {options.toppings.map(topping => (
            <label
              key={topping.id}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${selections.toppings.includes(topping.id)
                ? 'border-black bg-[#F4D4F4]'
                : 'border-gray-200 hover:border-black bg-white'
                }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selections.toppings.includes(topping.id)}
                  onChange={() => handleToggleTopping(topping.id)}
                  className="w-6 h-6 text-black border-2 border-black rounded focus:ring-black"
                />
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>{topping.name}</div>
                    {topping.extra_price > 0 && (
                      <div className="text-sm font-bold text-black bg-white/50 px-2 py-1 rounded">
                        +${parseFloat(topping.extra_price).toFixed(2)}
                      </div>
                    )}
                  </div>
                  {topping.description && (
                    <div className="text-xs font-medium text-gray-500 mt-1">{topping.description}</div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 rounded-3xl p-6 border-2 border-gray-100">
          <h4 className="font-black text-xl text-black mb-4 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Resumen de tu pastel</h4>
          <div className="space-y-3 text-sm font-medium">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Sabor</span>
              <span className="font-bold text-black text-lg">{getSelectedFlavor()?.name}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Tamaño</span>
              <div className="text-right">
                <span className="font-bold text-black block">{getSelectedSize()?.name}</span>
                <span className="text-gray-500 text-xs">${basePrice.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Relleno</span>
              <div className="text-right">
                <span className="font-bold text-black block">{getSelectedFilling()?.name || 'Sin relleno'}</span>
                {getSelectedFilling()?.extra_price > 0 && (
                  <span className="text-gray-500 text-xs">
                    +${parseFloat(getSelectedFilling().extra_price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            {getSelectedToppings().length > 0 && (
              <div className="flex justify-between items-start py-2 border-b border-gray-200">
                <span className="text-gray-600 mt-1">Toppings</span>
                <div className="text-right">
                  {getSelectedToppings().map(t => (
                    <div key={t.id} className="mb-1">
                      <span className="font-bold text-black">{t.name}</span>
                      {t.extra_price > 0 && (
                        <span className="text-gray-500 text-xs ml-1">
                          (+${parseFloat(t.extra_price).toFixed(2)})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-black text-xl text-black uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Total</span>
                <span className="text-3xl font-black text-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {calculating ? (
                    <span className="text-lg text-gray-500">Calculando...</span>
                  ) : calculatedPrice ? (
                    `$${calculatedPrice.toFixed(2)}`
                  ) : (
                    <span className="text-lg text-red-500">Error</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Cantidad */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-black uppercase">Cantidad</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelections(prev => ({
                    ...prev,
                    quantity: Math.max(1, prev.quantity - 1)
                  }))}
                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors font-bold text-xl"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={selections.quantity}
                  onChange={(e) => setSelections(prev => ({
                    ...prev,
                    quantity: Math.max(1, parseInt(e.target.value) || 1)
                  }))}
                  className="w-16 text-center font-black text-xl bg-transparent focus:outline-none"
                />
                <button
                  onClick={() => setSelections(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                  className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-4 text-right">
              <span className="text-gray-600 font-medium mr-2">Subtotal: </span>
              <span className="text-xl font-black text-black">
                ${((calculatedPrice || 0) * selections.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="animate-fade-in text-center py-12">
      <div className="w-24 h-24 bg-[#E8F442] rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-3xl font-black text-black mb-4 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        ¡Pastel Agregado!
      </h3>
      <p className="text-gray-600 text-lg mb-12 max-w-md mx-auto font-medium">
        Tu pastel personalizado ha sido agregado al carrito exitosamente. ¿Qué deseas hacer ahora?
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleClose}
          className="px-8 py-4 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-50 border-2 border-black transition-all duration-300 uppercase shadow-lg hover:shadow-none"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Cerrar y Seguir Comprando
        </button>
        <button
          onClick={handleCreateAnother}
          className="px-8 py-4 bg-black text-white text-sm font-bold rounded-full hover:bg-[#E8F442] hover:text-black border-2 border-black transition-all duration-300 uppercase shadow-lg hover:shadow-none"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Crear Otro Pastel
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? "¡ÉXITO!" : "DISEÑA TU PASTEL"}
      size="xl"
      footer={
        !isSuccess && (
          <div className="flex justify-between w-full items-center">
            <div>
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 text-sm font-bold text-black hover:underline uppercase tracking-wide"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  ← Anterior
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-black uppercase tracking-wide"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Cancelar
              </button>
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-[#E8F442] hover:text-black border-2 border-black transition-all duration-300 uppercase shadow-lg hover:shadow-none"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={loading || calculating || !calculatedPrice}
                  className="px-8 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-[#E8F442] hover:text-black border-2 border-black transition-all duration-300 uppercase shadow-lg hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {loading ? 'Agregando...' : 'Agregar al Carrito'}
                </button>
              )}
            </div>
          </div>
        )
      }
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : (
        <div className="py-4">
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}
          {!isSuccess && renderStepIndicator()}
          <div className="min-h-[400px]">
            {isSuccess ? renderSuccess() : (
              <>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CustomProductBuilder;
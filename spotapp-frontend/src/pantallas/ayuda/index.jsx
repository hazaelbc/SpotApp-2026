import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronDown, FiArrowLeft, FiSearch } from 'react-icons/fi';

export default function Ayuda() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqItems = [
    {
      category: 'Primeros pasos',
      items: [
        {
          q: '¿Cómo crear mi cuenta?',
          a: 'Haz clic en "Registrarse" en la pantalla de inicio. Completa tu nombre, correo y contraseña. La contraseña debe tener al menos 8 caracteres. ¡Listo! Ya puedes explorar lugares.',
        },
        {
          q: '¿Cómo iniciamos sesión?',
          a: 'Usa tu correo y contraseña en la pantalla de inicio. También puedes iniciar sesión con tu cuenta de Google.',
        },
        {
          q: '¿Qué es "Agregar lugar"?',
          a: '"Agregar lugar" es la forma de contribuir a SpotApp. Puedes compartir un lugar que encontraste, agregar una foto, descripción y ubicación exacta. Los otros usuarios podrán ver tu recomendación.',
        },
      ],
    },
    {
      category: 'Explorando lugares',
      items: [
        {
          q: '¿Cómo busco un lugar?',
          a: 'Usa la barra de búsqueda en la parte superior. Escribe el nombre del lugar, ciudad o categoría. Los resultados aparecerán automáticamente.',
        },
        {
          q: '¿Qué significa "Favoritos"?',
          a: 'Los favoritos son lugares que marcaste como especiales. Haz clic en el corazón para guardar un lugar. Puedes verlos en tu vista de "Favoritos".',
        },
        {
          q: '¿Cómo califico un lugar?',
          a: 'Abre la reseña de cualquier lugar. En el campo de comentarios, escribe tu opinión y usa las estrellas (★) para calificar de 1 a 5. Haz clic en enviar.',
        },
      ],
    },
    {
      category: 'Comentarios y reseñas',
      items: [
        {
          q: '¿Puedo editar mi comentario?',
          a: 'Sí. En tu propio comentario, haz clic en "Editar" (arriba a la derecha). Realiza los cambios y guarda.',
        },
        {
          q: '¿Cómo borro un comentario?',
          a: 'Haz clic en "Borrar" en tu comentario. Se eliminará inmediatamente.',
        },
        {
          q: '¿Qué significan los colores en los comentarios?',
          a: 'Los colores son etiquetas personales. Haz clic en la barra de color para elegir el color de tu comentario. Así lo identificas fácilmente.',
        },
      ],
    },
    {
      category: 'Cuenta y privacidad',
      items: [
        {
          q: '¿Cómo cambio mi ubicación?',
          a: 'En la pantalla principal, haz clic en tu ubicación actual (arriba). Puedes seleccionar tu ciudad manualmente o compartir tu ubicación exacta.',
        },
        {
          q: '¿Mis datos están seguros?',
          a: 'Sí. Usamos encriptación moderna para proteger tu información. Solo compartimos lo que tú autorizas.',
        },
        {
          q: '¿Cómo elimino mi cuenta?',
          a: 'Ve a Configuración (arriba a la derecha) y selecciona "Eliminar cuenta". Se borrará toda tu información de forma permanente.',
        },
      ],
    },
    {
      category: 'Solucionar problemas',
      items: [
        {
          q: '¿Por qué no puedo iniciar sesión?',
          a: 'Verifica que escribiste correctamente tu correo y contraseña. Si olvidaste la contraseña, haz clic en "¿Olvidaste tu contraseña?" en la pantalla de inicio.',
        },
        {
          q: '¿Por qué no cargan los lugares?',
          a: 'Revisa tu conexión a internet. Si el problema persiste, recarga la página. Si aún así no funciona, contacta a soporte.',
        },
        {
          q: '¿Cómo reporto un lugar inapropiado?',
          a: 'Haz clic en los 3 puntos (⋯) en la tarjeta del lugar y selecciona "Reportar". Nos ayudas a mantener SpotApp seguro.',
        },
      ],
    },
  ];

  const filteredFaqs = faqItems.map(category => ({
    ...category,
    items: category.items.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Centro de Ayuda</h1>
            <p className="text-sm text-[var(--text-tertiary)]">Encuentra respuestas a preguntas frecuentes</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-3.5 w-5 h-5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Busca en la ayuda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-[var(--text-tertiary)] transition-colors"
          />
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-tertiary)]">No encontramos resultados para "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-blue-500 hover:underline text-sm"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          filteredFaqs.map((category) => (
            <div key={category.category} className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border-color)]">
                {category.category}
              </h2>

              <div className="space-y-3">
                {category.items.map((item, idx) => {
                  const itemId = `${category.category}-${idx}`;
                  const isExpanded = expandedFaq === itemId;

                  return (
                    <div
                      key={itemId}
                      className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : itemId)}
                        className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                      >
                        <span className="font-medium text-[var(--text-primary)]">{item.q}</span>
                        <FiChevronDown
                          className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-4 py-3 bg-[var(--bg-primary)] border-t border-[var(--border-color)] text-[var(--text-secondary)] text-sm leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto px-4 py-8 border-t border-[var(--border-color)]">
        <p className="text-sm text-[var(--text-tertiary)] text-center">
          ¿No encontraste tu respuesta?{' '}
          <a href="mailto:soporte@spotapp.com" className="text-blue-500 hover:underline">
            Contacta a soporte
          </a>
        </p>
      </div>
    </div>
  );
}

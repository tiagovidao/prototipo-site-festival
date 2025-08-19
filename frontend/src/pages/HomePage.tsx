import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center bg-stone-100 dark:bg-stone-800/50 py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="font-serif text-5xl md:text-7xl mb-6 text-stone-900 dark:text-stone-100">
            Festival <span className="text-purple-700 dark:text-purple-400">Cultural</span>
          </h1>

          <Link 
            to="/inscricoes" 
            className="inline-block bg-purple-700 hover:bg-purple-800 text-white px-10 py-4 rounded-md transition-colors duration-300"
          >
            Inscreva-se Agora
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl mb-6 pb-4 border-b-2 border-purple-600 dark:border-purple-400 inline-block text-stone-900 dark:text-stone-100">
              Lorem ipsum
            </h2>
            <div className="space-y-5 mt-8 text-stone-700 dark:text-stone-300 text-lg">
              <p>
                Donec vitae orci ac sem tincidunt faucibus. Quisque fermentum nisl sit amet nunc fermentum, ut cursus massa interdum. Ut at orci sed velit dignissim sollicitudin. Proin gravida, mauris nec malesuada elementum, ex nibh tincidunt nunc, vel ultricies sem orci a lorem. Etiam ut semper neque.
              </p>
              <p>
                Durante o evento, oferecemos uma programação rica com oficinas, apresentações e palestras, 
                criando um ambiente de imersão e desenvolvimento artístico para todas as idades.
              </p>
            </div>
          </div>
          <div className="h-80 rounded-lg flex items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-700">
            <span className="text-stone-500 dark:text-stone-500">Imagem representativa do evento</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-stone-100 dark:bg-stone-800/50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Participantes' }, 
              { value: '12', label: 'Eventos' }, 
              { value: '4', label: 'Edições' }, 
              { value: '3', label: 'Dias' }
            ].map((stat) => (
              <div key={stat.label} className="p-4">
                <div className="font-serif text-4xl md:text-5xl mb-2 text-stone-900 dark:text-stone-100">
                  {stat.value}
                </div>
                <div className="text-stone-600 dark:text-stone-400 uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
import React from 'react';

interface GenericPageProps {
  title: string;
}

const GenericPage: React.FC<GenericPageProps> = ({ title }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center pb-6 border-b border-stone-200 dark:border-stone-700">
        {title}
      </h1>
      
      <div className="p-8 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
        <div className="space-y-5 text-stone-700 dark:text-stone-300 text-lg">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet nulla sed nisl tristique sagittis.
          </p>
          <p>
            Nulla facilisi. Vestibulum euismod finibus justo, at convallis nisl posuere vel. Suspendisse potenti.
          </p>
          <p>
             Sed pulvinar, augue ut elementum gravida, justo risus blandit eros, nec iaculis ligula elit sed nisl.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GenericPage;
// MathMexResult component definition

import Latex from "react-latex-next";

// It accepts title, introduction, and methodology as props
interface MathMexResultProps {
  query: string;
  result: string;
}

const MathMexResult = ({ query }: MathMexResultProps) => {
  return (
    <div style={{ ...mathMexResultStyles.card, ...mathMexResultStyles.marginY }}>
      {/* Header Section */}
      <header style={mathMexResultStyles.header}>
        <h1 style={mathMexResultStyles.title as React.CSSProperties}>
          <Latex>{query}</Latex>
        </h1>
      </header>

      {/* Content Section */}
      <section style={mathMexResultStyles.contentSection}>
        <p style={{ ...mathMexResultStyles.paragraph, ...mathMexResultStyles.marginTop }}>
          This is a mock result for: {query}
        </p>
      </section>
    </div>
  );
};

const mathMexResultStyles = {
  card: {
    backgroundColor: '#ffffff', // Equivalent to bg-white
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Equivalent to shadow-lg
    borderRadius: '0.5rem', // Equivalent to rounded-xl
    padding: '1rem', // Equivalent to p-4
  },
  marginY: {
    marginTop: '2rem', // Equivalent to my-8
    marginBottom: '2rem', // Equivalent to my-8
  },
  header: {
    marginBottom: '1rem', // Equivalent to mb-4
    paddingBottom: '0.75rem', // Equivalent to pb-3
    borderBottom: '1px solid #e5e7eb', // Equivalent to border-b border-gray-200
  },
  title: {
    fontSize: '1.5rem', // Equivalent to text-2xl (adjusted for sidebar)
    fontWeight: '800', // Equivalent to font-extrabold
    color: '#1f2937', // Equivalent to text-gray-800
    marginBottom: '0.25rem', // Equivalent to mb-1
    textAlign: 'center', // Equivalent to text-center
    lineHeight: '1.3', // Adjust line height for better display of LaTeX in title
  },
  contentSection: {
    color: '#374151', // Equivalent to text-gray-700
    lineHeight: '1.625', // Equivalent to leading-relaxed
    fontSize: '0.875rem', // Equivalent to text-sm
  },
  subHeading: {
    fontSize: '1.25rem', // Equivalent to text-xl
    fontWeight: '600', // Equivalent to font-semibold
    color: '#1f2937', // Equivalent to text-gray-800
    marginBottom: '0.5rem', // Equivalent to mb-2
  },
  paragraph: {
    marginBottom: '0.75rem', // Equivalent to mb-3
  },
  marginTop: {
    marginTop: '1rem', // Equivalent to mt-4
  }
};
export default MathMexResult;
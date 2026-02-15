import React from "react";

const SearchBar = ({ placeholder = "Buscar...", onSearch }) => {
  const handleInputChange = (event) => {
    if (onSearch) {
      onSearch(event.target.value); // Llama a la función `onSearch` con el valor ingresado
    }
  };

  const styles = {
    container: {
      width: "100%",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "8px",
      outline: "none",
    },
    
    input: {
      width: "100%",
      padding: "8px 12px",
      fontSize: "16px",
      border: "2px solid #ccc",
      borderRadius: "30px",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      color: "#1C1C1C",
    },
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder={placeholder}
        onChange={handleInputChange}
        style={styles.input}
      />
    </div>
  );
};

export default SearchBar;
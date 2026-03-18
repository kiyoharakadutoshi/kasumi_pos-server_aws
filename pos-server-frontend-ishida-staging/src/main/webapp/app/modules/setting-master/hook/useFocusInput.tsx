const INPUT_ID = 'register-number';
const UseFocusInput = () => {

  const handleFocusInput = () => {
    // select the first input
    const selectInput = document.getElementById(INPUT_ID);
    // check input exist and focus an input

    if (selectInput) {
      const focusInput = setTimeout(() => {
        selectInput.focus();
      }, 300);

      return () => clearTimeout(focusInput);
    }
  };

  return {handleFocusInput}
};

export default UseFocusInput;

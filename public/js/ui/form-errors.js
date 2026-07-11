function getField(form, fieldName) {
  return form.elements.namedItem(fieldName);
}

function getFieldContainer(field) {
  return field?.closest(".form-field");
}

function clearFieldError(field) {
  const fieldContainer = getFieldContainer(field);

  if (!fieldContainer) {
    return;
  }

  field.classList.remove("form-input--invalid");
  field.removeAttribute("aria-invalid");
  field.removeAttribute("aria-describedby");

  fieldContainer.querySelector(".form-error")?.remove();
}

function clearFormErrors(form) {
  const invalidFields = form.querySelectorAll(".form-input--invalid");

  invalidFields.forEach((field) => {
    clearFieldError(field);
  });
}

function showFieldError(form, fieldName, message) {
  const field = getField(form, fieldName);
  const fieldContainer = getFieldContainer(field);

  if (!field || !fieldContainer) {
    return false;
  }

  clearFieldError(field);

  const errorElement = document.createElement("p");
  const errorId = `${field.id}-error`;

  errorElement.id = errorId;
  errorElement.className = "form-error";
  errorElement.textContent = message;

  field.classList.add("form-input--invalid");
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", errorId);

  fieldContainer.append(errorElement);

  return true;
}

function showFormErrors(form, errors) {
  if (!Array.isArray(errors)) {
    return false;
  }

  clearFormErrors(form);

  let hasFieldErrors = false;

  errors.forEach((error) => {
    if (!error?.field || !error?.message) {
      return;
    }

    const wasRendered = showFieldError(
      form,
      error.field,
      error.message,
    );

    hasFieldErrors ||= wasRendered;
  });

  return hasFieldErrors;
}

function initializeFormErrorClearing(form) {
  form.addEventListener("input", (event) => {
    const field = event.target;

    if (!field.matches(".form-input--invalid")) {
      return;
    }

    clearFieldError(field);
  });
}

export {
  clearFormErrors,
  initializeFormErrorClearing,
  showFormErrors,
};
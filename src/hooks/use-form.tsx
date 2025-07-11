import { useState, ChangeEvent, FormEvent } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K], formData: T) => string | undefined;
};

// El hook useForm
export function useForm<T extends Record<string, unknown>>(
  initialState: T,
  validationRules: ValidationRules<T>,
  onSubmit: (formData: T) => Promise<void>
) {
  const [formData, setFormData] = useState<T>(initialState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: Partial<Record<keyof T, string>> = {};
    // Iteramos sobre las reglas definidas para validar cada campo
    for (const key in validationRules) {
      const rule = validationRules[key as keyof T];
      if (rule) {
        const error = rule(formData[key as keyof T], formData);
        if (error) {
          errors[key as keyof T] = error;
        }
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof T]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Manejo de errores seguro, verificando el tipo de 'error'
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error inesperado";
      setSubmissionError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    formErrors,
    isLoading,
    submissionError,
    handleInputChange,
    handleSubmit,
  };
}
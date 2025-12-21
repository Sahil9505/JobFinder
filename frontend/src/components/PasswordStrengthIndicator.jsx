import { useMemo } from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  // Define password requirements
  const requirements = useMemo(() => {
    return [
      {
        id: 'length',
        label: 'At least 8 characters',
        test: (pwd) => pwd.length >= 8,
      },
      {
        id: 'uppercase',
        label: 'At least 1 uppercase letter (A-Z)',
        test: (pwd) => /[A-Z]/.test(pwd),
      },
      {
        id: 'lowercase',
        label: 'At least 1 lowercase letter (a-z)',
        test: (pwd) => /[a-z]/.test(pwd),
      },
      {
        id: 'number',
        label: 'At least 1 number (0-9)',
        test: (pwd) => /[0-9]/.test(pwd),
      },
      {
        id: 'special',
        label: 'At least 1 special character (@#$%!&*)',
        test: (pwd) => /[@#$%!&*^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      },
    ];
  }, []);

  // Check which requirements are met
  const validationResults = useMemo(() => {
    return requirements.map(req => ({
      ...req,
      met: req.test(password),
    }));
  }, [password, requirements]);

  // Check if all requirements are met
  const allRequirementsMet = useMemo(() => {
    return validationResults.every(result => result.met);
  }, [validationResults]);

  // Don't show anything if password is empty
  if (!password) {
    return null;
  }

  return (
    <div className="mt-3 bg-dark-800/50 border border-dark-600 rounded-lg p-3 space-y-2">
      <p className="text-xs font-semibold text-gray-300 mb-2.5 flex items-center">
        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Password Requirements:
      </p>
      <ul className="space-y-1.5">
        {validationResults.map((result) => (
          <li 
            key={result.id} 
            className={`flex items-center text-xs transition-colors duration-200 ${
              result.met ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {result.met ? (
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{result.label}</span>
          </li>
        ))}
      </ul>
      {allRequirementsMet && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <p className="text-xs text-emerald-400 font-semibold flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Password meets all requirements
          </p>
        </div>
      )}
    </div>
  );
};

// Export validation function to use in forms
export const validatePassword = (password) => {
  if (!password) return false;
  
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[@#$%!&*^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  );
};

export default PasswordStrengthIndicator;

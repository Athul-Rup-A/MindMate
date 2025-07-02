import { Field, ErrorMessage } from 'formik';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useState } from 'react';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

const FormField = ({ label, name, type = 'text', placeholder, icon, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    return (
        <Form.Group className="mb-4">
            {label && <Form.Label>{label}</Form.Label>}
            <InputGroup>
                {icon && <InputGroup.Text>{icon}</InputGroup.Text>}

                <Field
                    name={name}
                    as={Form.Control}
                    type={inputType}
                    placeholder={placeholder}
                    {...props} // Disabled or readOnly
                />

                {type === 'password' && (
                    <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className='border border-dark border-opacity-25'
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '48px',
                            height: '38px',
                            padding: '0',
                        }}
                    >
                        {showPassword ? <EyeSlashFill /> : <EyeFill />}
                    </Button>
                )}
            </InputGroup>
            <ErrorMessage name={name} component="div" className="text-danger small mt-1" />
        </Form.Group>
    );
};

export default FormField;
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-md bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)] ' +
                className
            }
            ref={localRef}
        />
    );
});

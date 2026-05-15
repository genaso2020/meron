import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';

export default function Offcanvas({ children, show = false, closeable = true, onClose = () => {} }) {
    const close = () => {
        if (closeable) onClose();
    };

    return (
        <Transition show={show} leave="duration-200">
            <Dialog as="div" className="fixed inset-0 z-50" onClose={close}>
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-black/60" />
                </TransitionChild>

                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex max-w-full">
                            <TransitionChild
                                enter="transform transition ease-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in duration-200"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <DialogPanel className="pointer-events-auto h-full w-screen max-w-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-xl">
                                    {children}
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

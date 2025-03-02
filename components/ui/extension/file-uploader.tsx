'use client';

import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Trash2 as RemoveIcon } from 'lucide-react';
import { type Dispatch, type SetStateAction, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { type DropzoneOptions, type DropzoneState, type FileRejection, useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

type DirectionOptions = 'rtl' | 'ltr' | undefined;

type FileUploaderContextType = {
    dropzoneState: DropzoneState;
    isLOF: boolean;
    isFileTooBig: boolean;
    removeFileFromSet: (index: number) => void;
    activeIndex: number;
    setActiveIndex: Dispatch<SetStateAction<number>>;
    orientation: 'horizontal' | 'vertical';
    direction: DirectionOptions;
};

const FileUploaderContext = createContext<FileUploaderContextType | null>(null);

export const useFileUpload = () => {
    const context = useContext(FileUploaderContext);
    if (!context) {
        throw new Error('useFileUpload must be used within a FileUploaderProvider');
    }
    return context;
};

type FileUploaderProps = {
    value: File[] | null;
    reSelect?: boolean;
    onValueChange: (value: File[] | null) => void;
    dropzoneOptions: DropzoneOptions;
    orientation?: 'horizontal' | 'vertical';
};

export const FileUploader = ({
    ref,
    className,
    dropzoneOptions,
    value,
    onValueChange,
    reSelect,
    orientation = 'vertical',
    children,
    dir,
    ...props
}) => {
    const [isFileTooBig, setIsFileTooBig] = useState(false);
    const [isLOF, setIsLOF] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const {
        accept = {
            'image/*': ['.jpg', '.jpeg', '.png', '.gif']
        },
        maxFiles = 1,
        maxSize = 4 * 1024 * 1024,
        multiple = true
    } = dropzoneOptions;

    const reSelectAll = maxFiles === 1 ? true : reSelect;
    const direction: DirectionOptions = dir === 'rtl' ? 'rtl' : 'ltr';

    const removeFileFromSet = useCallback(
        (i: number) => {
            if (!value) return;
            const newFiles = value.filter((_, index) => index !== i);
            onValueChange(newFiles);
        },
        [value, onValueChange]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            if (!value) return;

            const moveNext = () => {
                const nextIndex = activeIndex + 1;
                setActiveIndex(nextIndex > value.length - 1 ? 0 : nextIndex);
            };

            const movePrev = () => {
                const nextIndex = activeIndex - 1;
                setActiveIndex(nextIndex < 0 ? value.length - 1 : nextIndex);
            };

            const prevKey = orientation === 'horizontal' ? (direction === 'ltr' ? 'ArrowLeft' : 'ArrowRight') : 'ArrowUp';

            const nextKey = orientation === 'horizontal' ? (direction === 'ltr' ? 'ArrowRight' : 'ArrowLeft') : 'ArrowDown';

            if (e.key === nextKey) {
                moveNext();
            } else if (e.key === prevKey) {
                movePrev();
            } else if (e.key === 'Enter' || e.key === 'Space') {
                if (activeIndex === -1) {
                    dropzoneState.inputRef.current?.click();
                }
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                if (activeIndex !== -1) {
                    removeFileFromSet(activeIndex);
                    if (value.length - 1 === 0) {
                        setActiveIndex(-1);
                        return;
                    }
                    movePrev();
                }
            } else if (e.key === 'Escape') {
                setActiveIndex(-1);
            }
        },
        [value, activeIndex, removeFileFromSet]
    );

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            const files = acceptedFiles;

            if (!files) {
                toast.error('file error , probably too big');
                return;
            }

            const newValues: File[] = value ? [...value] : [];

            if (reSelectAll) {
                newValues.splice(0, newValues.length);
            }

            files.forEach((file) => {
                if (newValues.length < maxFiles) {
                    newValues.push(file);
                }
            });

            onValueChange(newValues);

            if (rejectedFiles.length > 0) {
                for (let i = 0; i < rejectedFiles.length; i++) {
                    if (rejectedFiles[i].errors[0]?.code === 'file-too-large') {
                        toast.error(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`);
                        break;
                    }
                    if (rejectedFiles[i].errors[0]?.message) {
                        toast.error(rejectedFiles[i].errors[0].message);
                        break;
                    }
                }
            }
        },
        [reSelectAll, value]
    );

    useEffect(() => {
        if (!value) return;
        if (value.length === maxFiles) {
            setIsLOF(true);
            return;
        }
        setIsLOF(false);
    }, [value, maxFiles]);

    const opts = dropzoneOptions ? dropzoneOptions : { accept, maxFiles, maxSize, multiple };

    const dropzoneState = useDropzone({
        ...opts,
        onDrop,
        onDropRejected: () => setIsFileTooBig(true),
        onDropAccepted: () => setIsFileTooBig(false)
    });

    return (
        <FileUploaderContext.Provider
            value={{
                dropzoneState,
                isLOF,
                isFileTooBig,
                removeFileFromSet,
                activeIndex,
                setActiveIndex,
                orientation,
                direction
            }}>
            <div
                ref={ref}
                // biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
                tabIndex={0}
                onKeyDownCapture={handleKeyDown}
                className={cn('grid w-full overflow-hidden focus:outline-hidden', className, {
                    'gap-2': value && value.length > 0
                })}
                dir={dir}
                {...props}>
                {children}
            </div>
        </FileUploaderContext.Provider>
    );
};

FileUploader.displayName = 'FileUploader';

export const FileUploaderContent = ({
    ref,
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    ref: React.RefObject<HTMLDivElement>;
}) => {
    const { orientation } = useFileUpload();
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className={cn('w-full px-1')} ref={containerRef}>
            <div
                {...props}
                ref={ref}
                className={cn('flex gap-1 rounded-xl', orientation === 'horizontal' ? 'flex-raw flex-wrap' : 'flex-col', className)}>
                {children}
            </div>
        </div>
    );
};

FileUploaderContent.displayName = 'FileUploaderContent';

export const FileUploaderItem = ({ ref, className, index, children, ...props }) => {
    const { removeFileFromSet, activeIndex, direction } = useFileUpload();
    const isSelected = index === activeIndex;
    return (
        <div
            ref={ref}
            className={cn(
                buttonVariants({ variant: 'ghost' }),
                'relative h-6 justify-between p-1',
                className,
                isSelected ? 'bg-muted' : ''
            )}
            {...props}>
            <div className='flex h-full w-full items-center gap-1.5 font-medium leading-none tracking-tight'>{children}</div>
            <button
                type='button'
                className={cn('absolute rounded bg-white p-0.5', direction === 'rtl' ? 'bottom-1 left-1' : 'right-1 bottom-1')}
                onClick={() => removeFileFromSet(index)}>
                <span className='sr-only'>remove item {index}</span>
                <RemoveIcon className='size-5 duration-200 ease-in-out hover:stroke-destructive' />
            </button>
        </div>
    );
};

FileUploaderItem.displayName = 'FileUploaderItem';

export const FileInput = ({
    ref,
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    ref: React.RefObject<HTMLDivElement>;
}) => {
    const { dropzoneState, isLOF } = useFileUpload();
    const rootProps = isLOF ? {} : dropzoneState.getRootProps();
    const { isDragActive, isDragAccept } = dropzoneState;

    return (
        <div ref={ref} {...props} className={cn('relative w-full', isLOF ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)}>
            <div
                className={cn(
                    'flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-background transition-colors duration-100 ease-in-out hover:border-primary',
                    isDragActive && 'border-primary bg-primary/20',
                    isDragAccept && 'border-primary'
                    // (isDragReject || isFileTooBig) && 'border-red-500'
                )}
                {...rootProps}>
                {children}
            </div>
            <Input
                ref={dropzoneState.inputRef}
                disabled={isLOF}
                {...dropzoneState.getInputProps()}
                className={`${isLOF ? 'cursor-not-allowed' : ''}`}
            />
        </div>
    );
};

FileInput.displayName = 'FileInput';

//  <FileUploaderContent className='flex items-center flex-row flex-wrap gap-2 w-full'>
//     {files?.map((file, i) => (
//         <FileUploaderItem
//             key={i}
//             index={i}
//             className='size-20 md:size-28 p-0 rounded-md overflow-hidden'
//             aria-roledescription={`file ${i + 1} containing ${file.name}`}>
//             <img src={URL.createObjectURL(file)} alt={file.name} height={80} width={80} className='w-full h-full object-cover object-center p-0' />
//         </FileUploaderItem>
//     ))}

//     {files &&
//         files.length > 0 &&
//         files.map((file, i) => (
//             <FileUploaderItem key={i} index={i} className='w-full '>
//                 <Paperclip className='h-4 w-4 stroke-current' />
//                 <span>{file.name}</span>
//             </FileUploaderItem>
//         ))}
// </FileUploaderContent>

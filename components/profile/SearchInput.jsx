import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Input, Button } from '@nextui-org/react';
import { FaArrowRight } from "react-icons/fa";
import { RiSearchLine } from 'react-icons/ri';
import { formatSteamProfileUrl } from '@/utils/utils';

export default function SearchInput({ countryCode, countryAbbr, isLoading }) {
    const router = useRouter();
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = async () => {
        if (inputValue.length > 0) {
            const formatInput = formatSteamProfileUrl(inputValue);
            if (countryCode) {
                router.push({
                    pathname: formatInput,
                    query: {
                        cc: countryCode,
                        abbr: countryAbbr
                    },
                });
            } else {
                router.push(formatInput);
            }
            setInputValue('');
        }
    };

    const handleChange = (e) => {
        setInputValue(e.target.value.trim());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <React.Fragment>
            <div className='relative flex items-end w-full xl:w-[450px]'>
                <Input
                    size='lg'
                    startContent={<RiSearchLine className='text-neutral-500' fontSize={20} />}
                    placeholder='Search again'
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className=''
                    endContent={
                        <Button
                            size='sm'
                            isIconOnly
                            isDisabled={!inputValue > 0}
                            startContent={<FaArrowRight />}
                            onClick={handleSubmit}
                            className='bg-pop text-white dark:text-black ml-[20px]'
                        />
                    }
                    classNames={{
                        inputWrapper: [
                            'bg-base',
                            'hover:!bg-base-hover',
                            'group-data-[focus=true]:!bg-base-hover',
                            'group-data-[focus=true]:!shadow-custom',
                            'border',
                            'border-light-border',
                            'group-data-[focus=true]:!border-hover-border',
                            'hover:!border-hover-border',
                            'rounded-lg',
                        ],
                    }}
                />
            </div>
        </React.Fragment>
    )
}
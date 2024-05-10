import React from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { countryCodes } from '@/constants/constants';

export default function CurrencySelect({ setCountryCode, setCountryAbbr }) {
    const handleSelection = (e) => {
        setCountryCode(e.currentKey);
        if (e.currentKey === 'au') setCountryAbbr('AUD');
        if (e.currentKey === 'uk') setCountryAbbr('GBP');
        if (e.currentKey === 'ca') setCountryAbbr('CAD');
        if (e.currentKey === 'eu') setCountryAbbr('EUR');
        if (e.currentKey === 'nz') setCountryAbbr('NZD');
        if (e.currentKey === 'us') setCountryAbbr('USD');
    };

    return (
        <Select
            size='sm'
            radius='sm'
            aria-label='currency'
            label='Currency'
            onSelectionChange={handleSelection}
            className='w-full lg:w-[300px]'
            classNames={{
                trigger: [
                    '!bg-base',
                    'hover:!bg-base-hover',
                    'group-data-[open=true]:!shadow-custom',
                    'border',
                    'border-light-border',
                    'hover:!border-hover-border',
                ],
                value: ['!text-white'],
                label: ['!text-neutral-400']
            }}
            popoverProps={{ classNames: { content: ['!bg-base', '!border', '!border-light-border', 'group-data-[focus=true]:!shadow-custom'] } }}
        >
            {countryCodes.map((code) => (
                <SelectItem
                    aria-label={code.value}
                    key={code.value}
                    value={code.value}
                >
                    {code.label}
                </SelectItem>
            ))}
        </Select>
    )
}
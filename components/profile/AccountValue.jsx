import React from 'react';
import { Skeleton, Tooltip } from '@nextui-org/react';
import { FiInfo } from "react-icons/fi";

export default function AccountValue({ totals }) {
    return (
        <React.Fragment>
            <div className='flex justify-center items-center md:justify-end mt-5 lg:mt-0'>
                <div className='flex items-center flex-col lg:items-end'>
                    <p className='font-medium text-2xl'>
                        Account Value
                    </p>
                    <div className='flex flex-wrap justify-center gap-4 md:justify-start md:gap-10'>
                        <Tooltip closeDelay={0} className='bg-tooltip' content='Based on game prices as of a few seconds ago'>
                            <div className='flex items-center flex-col'>
                                <Skeleton isLoaded={totals} className="rounded-full">
                                    <p className='font-medium text-red-400 text-3xl'>
                                        {totals ? (totals.totalFinalFormatted) : ('$0,000.00')}
                                    </p>
                                </Skeleton>
                                <p className='flex items-center gap-1 text-xs text-neutral-500'>
                                    current price
                                    <FiInfo />
                                </p>
                            </div>
                        </Tooltip>
                        <Tooltip closeDelay={0} className='bg-tooltip' content='Based on game prices as of a few seconds ago'>
                            <div className='flex items-center flex-col'>
                                <Skeleton isLoaded={totals} className="rounded-full">
                                    <p className='font-medium text-green-400 text-3xl'>
                                        {totals ? (totals.totalInitialFormatted) : ('$0,000.00')}
                                    </p>
                                </Skeleton>
                                <p className='flex items-center gap-1 text-xs text-neutral-500'>
                                    inital price
                                    <FiInfo />
                                </p>
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
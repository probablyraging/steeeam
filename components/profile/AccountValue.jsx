import React from 'react';
import { Divider, Skeleton, Tooltip } from '@nextui-org/react';
import { PiGraphBold } from "react-icons/pi";

export default function AccountValue({ totals }) {
    return (
        <React.Fragment>
            <div className='flex flex-col w-full mt-14'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-1'>
                        <PiGraphBold fontSize={22} />
                        <p id='games-list' className='text-lg font-medium py-2'>
                            Account Statistics
                        </p>
                    </div>
                </div>

                <Divider className='w-full h-[1px] bg-light-border mb-5 lg:mb-5' />

                <div className='flex justify-center items-center lg:justify-start'>
                    <div className='flex justify-center items-center flex-col w-full lg:items-start'>
                        <div className='flex flex-wrap justify-evenly gap-4 w-full lg:justify-start md:gap-10'>
                            <Tooltip closeDelay={0} className='bg-tooltip' content='Based on game prices as of a few seconds ago'>
                                <div className='flex items-center flex-col lg:items-start'>
                                    <p className='text-md text-dull font-medium sm:text-lg'>
                                        Current Price
                                    </p>
                                    <Skeleton isLoaded={totals} className="rounded-full">
                                        <p className='text-2xl font-bold text-red-400 md:text-3xl'>
                                            {totals ? (totals.totalFinalFormatted) : ('$0,000.00')}
                                        </p>
                                    </Skeleton>
                                </div>
                            </Tooltip>
                            <Tooltip closeDelay={0} className='bg-tooltip' content='Based on game prices as of a few seconds ago'>
                                <div className='flex items-center flex-col lg:items-start'>
                                    <p className='text-md text-dull font-medium sm:text-lg'>
                                        Initial Price
                                    </p>
                                    <Skeleton isLoaded={totals} className="rounded-full">
                                        <p className='text-2xl font-bold text-green-400 md:text-3xl'>
                                            {totals ? (totals.totalInitialFormatted) : ('$0,000.00')}
                                        </p>
                                    </Skeleton>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
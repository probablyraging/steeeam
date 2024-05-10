import React, { useState } from 'react';
import Link from 'next/link';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { FaRegCopy } from 'react-icons/fa';

export default function IdModal({ isOpen, onOpenChange, userSummary }) {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = (value) => {
        navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };

    return (
        <React.Fragment>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} className='absolute top-[200px] bg-base border border-light-border max-w-[90%] lg:min-w-[600px] lg:lg:max-w-[800px]'>
                <ModalContent>
                    <React.Fragment>
                        <ModalHeader></ModalHeader>
                        <ModalBody>
                            <table className='border border-light-border border-separate border-spacing-0 w-full rounded-md text-sm'>
                                <tbody>
                                    <tr className='hover:bg-base-hover'>
                                        <td className='border-b border-light-border p-2'>
                                            <p>Vanity URL</p>
                                        </td>
                                        <td className='border-l border-b border-light-border p-2 max-w-[100px]'>
                                            <Link href={`https://steamcommunity.com/id/probablyraging/${userSummary.customURL}`} target='_blank'>
                                                <p className='truncate'>{userSummary.customURL}</p>
                                            </Link>
                                        </td>
                                        <td className='w-[33px] border-l border-b border-light-border cursor-pointer p-2' onClick={() => copyToClipboard(userSummary.customURL)}>
                                            <FaRegCopy />
                                        </td>
                                    </tr>
                                    <tr className='hover:bg-base-hover'>
                                        <td className='border-b border-light-border p-2'>
                                            <p>Short URL</p>
                                        </td>
                                        <td className='border-l border-b border-light-border p-2 max-w-[100px]'>
                                            <Link href={userSummary.shortURL} target='_blank'>
                                                <p className='truncate'>{userSummary.shortURL}</p>
                                            </Link>
                                        </td>
                                        <td className='w-[33px] border-l border-b border-light-border cursor-pointer p-2' onClick={() => copyToClipboard(userSummary.shortURL)}>
                                            <FaRegCopy />
                                        </td>
                                    </tr>
                                    <tr className='hover:bg-base-hover'>
                                        <td className='border-b border-light-border p-2'>
                                            <p>Account ID</p>
                                        </td>
                                        <td className='border-l border-b border-light-border p-2'>
                                            <p>{userSummary.accountId}</p>
                                        </td>
                                        <td className='w-[33px] border-l border-b border-light-border cursor-pointer p-2' onClick={() => copyToClipboard(userSummary.accountId)}>
                                            <FaRegCopy />
                                        </td>
                                    </tr>
                                    <tr className='hover:bg-base-hover'>
                                        <td className='border-b border-light-border p-2'>
                                            <p>Steam ID</p>
                                        </td>
                                        <td className='border-l border-b border-light-border p-2 max-w-[100px]'>
                                            <Link href={`https://steamcommunity.com/id/probablyraging/${userSummary.steamId}`} target='_blank'>
                                                <p className='truncate'>{userSummary.steamId}</p>
                                            </Link>
                                        </td>
                                        <td className='w-[33px] border-l border-b border-light-border cursor-pointer p-2' onClick={() => copyToClipboard(userSummary.steamId)}>
                                            <FaRegCopy />
                                        </td>
                                    </tr>
                                    <tr className='hover:bg-base-hover'>
                                        <td className='border-b border-light-border p-2'>
                                            <p>Steam2 ID</p>
                                        </td>
                                        <td className='border-l border-b border-light-border p-2 max-w-[100px]'>
                                            <p className='truncate'>{userSummary.steam2}</p>
                                        </td>
                                        <td className='w-[33px] border-l border-b border-light-border cursor-pointer p-2' onClick={() => copyToClipboard(userSummary.steam2)}>
                                            <FaRegCopy />
                                        </td>
                                    </tr>
                                    <tr className='hover:bg-base-hover'>
                                        <td className='p-2'>
                                            <p>Steam3 ID</p>
                                        </td>
                                        <td className='border-l border-light-border p-2'>
                                            <Link href={`https://steamcommunity.com/id/probablyraging/${userSummary.steam3}`} target='_blank'>
                                                <p>{userSummary.steam3}</p>
                                            </Link>
                                        </td>
                                        <td className='w-[33px] border-l border-light-border cursor-pointer p-2' onClick={() => copyToClipboard(userSummary.steam3)}>
                                            <FaRegCopy />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </ModalBody>
                        <ModalFooter></ModalFooter>
                    </React.Fragment>
                </ModalContent>
                <div className={`${isCopied ? 'flex' : 'hidden'} flex fixed bottom-0 right-0 m-5 z-50`}>
                    <div className='bg-base border border-light-border rounded-md p-4'>
                        <p className='font-medium'>Copied to clipboard</p>
                    </div>
                </div>
            </Modal>
        </React.Fragment>
    )
}
import React from 'react'

export const FolderFilled = (props) => {
    const d = 'M13 4H7V3c0-.66-.31-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM6 4H1V3h5v1z'
    return (<svg style={props.style} version='1.1' viewBox='0 -1 14 15'>
        <path fillRule='evenodd' d={d}></path>
    </svg>)
}

export const FolderFilledBar = (props) => {
    const d = 'm13 4h-6c-0.0087-0.66 0.19-1.7-0.67-1.9-0.94-0.17-1.9 0.011-2.8-0.058-0.95 0.001-1.9-0.074-2.9 0.075-0.72 0.35-0.62 1.3-0.6 1.9-0.0031 2.2-0.018 4.3-0.025 6.5h12v1.8h-12c-0.16 0.75 0.22 1.9 1.2 1.7 4 0.004 8 0.027 12-0.007 0.89-0.2 0.87-1.3 0.82-2-0.059-2.4 0.047-4.8-0.051-7.2-0.08-0.44-0.52-0.76-0.96-0.76zm-7 0h-5v-1h5v1z'
    return (<svg style={props.style} version='1.1' viewBox='0 -1 14 15'>
        <path fillRule='evenodd' d={d}></path>
    </svg>)
}


export const FileEmpty = (props) => {
    const d ='M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z'
    return (<svg style={props.style} version='1.1' viewBox='0 -1 14 15'>
        <path fillRule='evenodd' d={d}></path>
    </svg>)
}

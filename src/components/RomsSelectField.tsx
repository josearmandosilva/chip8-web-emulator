import * as React from 'react';
import Rom from '../interfaces/Rom';

interface IRomProps {
    roms : Rom[], 
    disabled: boolean,
    onChange?: (rom: Rom) => void
}

const RomsSelectField = (props : IRomProps): JSX.Element => {

    const onChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        props.onChange(props.roms.find(element => element.file == ev.target.value));
    }

    return (
        <select onChange={ e => onChange(e) } disabled={props.disabled} className="rounded-none block py-2.5 p-2 w-full text-sm text-gray-500 bg-transparent border-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer">
            <option selected={true} disabled={true}>Select a ROM to start</option>
            { props.roms.map((rom) => <option key={rom.title} value={rom.file}>{rom.title}</option>) }
        </select>
    );
}

export default RomsSelectField;
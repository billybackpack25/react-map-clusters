import React from 'react';
import {Icon} from '@iconify/react';
import fireIcon from '@iconify/icons-emojione/fire';

const Header = (props) => {
    return (
        <div className="header-bar">
            <Icon icon={fireIcon} /> Xtreme Eather Events 
        </div>
    );
};

export default Header;
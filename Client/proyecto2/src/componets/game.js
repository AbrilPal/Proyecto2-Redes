import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const gamepage = () => {

    return (
        <div className='Homepage'>
            game
        </div>
    )
}

export default gamepage
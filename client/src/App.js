import React, {useState, useEffect} from 'react';
import Header from './components/Header/Header'
import SearchAndMap from './components/SearchAndMap/SearchMap'
import './App.css'

const App = () => {
    return (
        <div className='body'>
            <Header/>
            <SearchAndMap/>
        </div> 
    )
}

export default App;

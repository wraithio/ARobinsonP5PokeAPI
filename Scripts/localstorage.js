function saveToLocalStorage(name){
    let nameArr = getFromLocalStorage();

    if(!nameArr.includes(name))
    {
        nameArr.push(`${name}`);
    }

    localStorage.setItem('Names',JSON.stringify(nameArr));
}

function getFromLocalStorage(){
    let localStorageData = localStorage.getItem('Names');

    if(localStorageData == null){
        return [];
    }
            return JSON.parse(localStorageData);
    

}

function removeFromLocalStorage(pokemon){
    let localStorageData = getFromLocalStorage();

    let pokeIndex = localStorageData.indexOf(pokemon);

    localStorageData.splice(pokeIndex, 1);

    localStorage.setItem('Names', JSON.stringify(localStorageData));
}

export{saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage}
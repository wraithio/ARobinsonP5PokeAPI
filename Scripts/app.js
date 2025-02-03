import {saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage} from "./localstorage.js"

let shiny = false
let descriptions = [abilityDes1,abilityDes2,abilityDes3]
let abilityTitles = [ability1,ability2,ability3]
userInput.value = ""
let fav = false
warningText.style.visibility = "hidden"
let generate = async (userInput) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${userInput}`)
    if(!response.ok)
    {
       warningText.style.visibility = "visible"
        warningText.innerText = "No data found."
        return null
    }
    
    const data = await response.json()    
    warningText.style.visibility = "hidden"
    if(data.id > 649)
    {
        warningText.style.visibility = "visible"
        warningText.innerText = "Only Pokemon Gen I-V (1-649)"
    }
    else
    {
        evolList.innerText = ""
        getFromLocalStorage()
        if(localStorage.Names.includes(capitalize(data.name)))
        {
            favBtn.src ="/Assets/star-solid-24.png"
        }
        else(
            favBtn.src ="/Assets/star-regular-24.png"
        )

        for(let i = 0; i < descriptions.length; i++)
        {
            descriptions[i].innerText = ""
            abilityTitles[i].innerText = ""
        }
        console.log(data)
        evolNone.innerText = ""
        pokemonName.innerText = capitalize(data.name)
        if(data.types.length == 1)
        {
            pokemonType.innerText = `type: ${capitalize(data.types[0].type.name)}`
        }
        else
        {
            pokemonType.innerText = `type: ${capitalize(data.types[0].type.name)}/${capitalize(data.types[1].type.name)}`
        }
        pokemonNum.innerText = ` ${data.id}`
        findPokeLoc(data.id)
        findEvol(data.id)
        pokeImg.src = data.sprites.other.home.front_default
        pokeImg.alt = data.name
        prevBtn.style.visibility = (data.id == 1) ? "hidden" : "visible";
        nextBtn.style.visibility = (data.id == 649) ? "hidden" : "visible";        

        for(let i = 0; i < data.abilities.length; i++)
        {
            findDescription(data.abilities[i].ability.url,i)
        }
        let moveList = data.moves
        let moveArr = []
        moveBlock.innerText = ""
        for(let i = 0;i < moveList.length; i++)
        {
            moveArr.push(capitalize(moveList[i].move.name))
        }
        moveArr.forEach((item) =>{
            const li = document.createElement('li')
            li.innerText = "-" + item
            moveBlock.appendChild(li)
        })
    }
    return data
}

let findDescription = async (url,num) =>{
    const response = await fetch(url)
    const data = await response.json()
    // console.log(data)
    if(data.effect_entries != null)
    {
        abilityTitles[num].innerText = capitalize(data.name)
        descriptions[num].innerText = capitalize(data.effect_entries[1].short_effect)
    }
}

let findPokeLoc = async (id) =>{
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`)
    const data = await response.json()
    // console.log(data)
    if(data.length == 0)
    {
        pokemonLoc.innerText = "location: unknown"
    }
    else
    {
        pokemonLoc.innerText = `@ ${capitalize(data[0].location_area.name)}`
    }
    return data
}

//evol psuedocode
//fetch pokemon-species to find evolves_from_species
//iterate through species until evolve_from_species == null
//this will find the first evolution of whatever pokemon is selected
//then create a div, img and h3 with current pokemon and append to evolTree
//then, fetch pokemon-species from evolves_to.name
//create a div, img and h3 with next pokemon then next until evolves_to = null

let findEvol = async (id) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
    const data = await response.json()
    // console.log(data)
    if(data.evolves_from_species != null)
    {
        findEvol(data.evolves_from_species.name)
    }
    else
    {
        findRootPokemon(data.evolution_chain.url)
    }
}


let findRootPokemon = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    // console.log(data)
    if(data.chain.evolves_to.length == 0)
    {
        evolList.innerText = ""
        evolNone.innerText = "N/A"
    }
    else
    {
        evolNone.innerText = ""
        findEvolChain(data.chain.species.url)
    }
}

let findEvolChain = async (url) => {
    const response = await fetch(url)
    let data = await response.json()
    // console.log(data)
    const responseEvol = await fetch(data.evolution_chain.url)
    data = await responseEvol.json()
    addToEvolChain(data.chain)
}

let addToEvolChain = async (chain) =>{  
    let evolTree = [capitalize(chain.species.name)];
        for(let i = 0 ; i < chain.evolves_to.length ; i++)
    {
        evolTree.push(capitalize(chain.evolves_to[i].species.name));
        if(chain.evolves_to[i].evolves_to.length != 0)
        {
            evolTree.push(capitalize(chain.evolves_to[i].evolves_to[0].species.name));
        }
    }
    console.log(evolTree)
    evolList.className = evolTree.length > 3 ? "evolBlock" : "evolBlock flex justify-evenly";
    evolTree.map((name) => {
       let evolDiv = document.createElement("div");
    evolDiv.className = "flex flex-col justify-center"
    let h3 = document.createElement("h3");
    h3.innerText = name
    h3.className = "evolName"
    let evolIcon = document.createElement("img")
        evolIcon.id = "favIcon"
        findPokemonPic(name,evolIcon) 
        evolDiv.appendChild(evolIcon)
        evolDiv.appendChild(h3)
        evolList.append(evolDiv)
        h3.addEventListener("click", async()=>{
            generate(formatForSearch(name))
        })
        evolIcon.addEventListener("click", async()=>{
            generate(formatForSearch(name))
        })
    })
}

const isShiny = async (toggle) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${formatForSearch(pokemonName.innerText)}`);
    const data = await response.json();
    pokeImg.src = data.sprites.other.home[toggle ? 'front_default' : 'front_shiny'];
};

let favorite = (pokemon) => {
    saveToLocalStorage(pokemon)
    addToFavs(pokemon)
}

let findPokemonPic = async (name,pic) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${formatForSearch(name)}`)
    const data = await response.json()
    pic.src = data.sprites.other.home.front_default
    pic.alt = name
}

let addToFavs = (name) =>{
    let favBlock = document.createElement("div")
        favBlock.className = "flex items-center favDiv"
        let pokeIcon = document.createElement("img")
        pokeIcon.id = "favIcon"
        findPokemonPic(name,pokeIcon)
        let h3 = document.createElement("h3");
        h3.innerText = name;
        h3.id = "favItem";
        h3.addEventListener("click", async()=>{
            generate(formatForSearch(name))
        })
        pokeIcon.addEventListener("click", async()=>{
            generate(formatForSearch(name))
        })
        let removeBtn = document.createElement("h3");
        removeBtn.id = "remove";
        removeBtn.innerText = "X";
        removeBtn.addEventListener("click", async () => {
            removeFromLocalStorage(name);
            h3.remove();
            removeBtn.remove()
            pokeIcon.remove()
            if(name == pokemonName.innerText)
            {
                favBtn.src = "/Assets/star-regular-24.png"
                fav = false
            }
          });
          favBlock.appendChild(pokeIcon)
          favBlock.appendChild(h3)
          favBlock.append(removeBtn);
          favList.appendChild(favBlock);
}

let createFavs = () =>{
    let pokeNames = getFromLocalStorage();

    pokeNames.map((name) => {
        let favBlock = document.createElement("div")
        favBlock.className = "flex items-center favDiv"
        let pokeIcon = document.createElement("img")
        pokeIcon.id = "favIcon"
        findPokemonPic(name,pokeIcon)
        let h3 = document.createElement("h3");
        h3.innerText = name;
        h3.id = "favItem";
        h3.addEventListener("click", async()=>{
            generate(formatForSearch(name))
        })
        pokeIcon.addEventListener("click", async()=>{
            generate(formatForSearch(name))
        })
        let removeBtn = document.createElement("h3");
        removeBtn.id = "remove";
        removeBtn.innerText = "X";
        removeBtn.addEventListener("click", async () => {
            removeFromLocalStorage(name);
            h3.remove();
            removeBtn.remove()
            pokeIcon.remove()
            if(name == pokemonName.innerText)
            {
                favBtn.src = "/Assets/star-regular-24.png"
                fav = false
            }
          });   

          favBlock.appendChild(pokeIcon)
          favBlock.appendChild(h3)
          favBlock.append(removeBtn);
          favList.appendChild(favBlock);
    });
}

function formatForSearch(input) {
    let transformedString = input.replace(/ /g, '-');
    transformedString = transformedString.toLowerCase();
    return transformedString;
}

let capitalize = (string) =>{
    return string
    .toLowerCase()
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

}

nextBtn.addEventListener("click", () =>{
    generate(parseInt(pokemonNum.innerText) + 1)
})
prevBtn.addEventListener("click", () =>{
    generate(parseInt(pokemonNum.innerText) - 1)
});

generateBtn.addEventListener("click",() =>{
    if(userInput.value.trim() === "")
    {
        warningText.style.visibility = "visible"
        warningText.innerText = "Enter a valid name/number."
    }
    else
    {
        warningText.style.visibility = "hidden"
        generate(formatForSearch(userInput.value.trim()))
        userInput.value = ""
    }
});

userInput.addEventListener("keydown", async (event) =>{
    if(event.key === "Enter")
    {
    if(userInput.value.trim() === "")
    {
        warningText.style.visibility = "visible"
        warningText.innerText = "Enter a valid name/number."
    }
    else
    {
        warningText.style.visibility = "hidden"
        generate(formatForSearch(userInput.value.trim()))
        userInput.value = ""
    }
    }
});

shinyBtn.addEventListener("mouseover", () => {
    shinyBtn.src = shiny ? "/Assets/sparkles-icon-2048x2047-didnltrp.png" : "/Assets/sparklesSELECT-icon-2048x2047-didnltrp.png";
});

shinyBtn.addEventListener("mouseout", () => {
    shinyBtn.src = shiny ? "/Assets/sparklesSELECT-icon-2048x2047-didnltrp.png" : "/Assets/sparkles-icon-2048x2047-didnltrp.png";
});

shinyBtn.addEventListener("click", () => {
    isShiny(shiny);
    shinyBtn.src = shiny ? "/Assets/sparkles-icon-2048x2047-didnltrp.png" : "/Assets/sparklesSELECT-icon-2048x2047-didnltrp.png";
    shiny = !shiny;
});

favBtn.addEventListener("mouseover", () => {
    favBtn.src = fav ? "/Assets/star-regular-24.png" : "/Assets/star-solid-24.png";
});

favBtn.addEventListener("mouseout", () => {
    favBtn.src = fav ? "/Assets/star-solid-24.png" : "/Assets/star-regular-24.png";
});

favBtn.addEventListener("click", () => {
    fav ? removeFromLocalStorage(pokemonName.innerText) : favorite(pokemonName.innerText);
    favBtn.src = fav ? "/Assets/star-regular-24.png" : "/Assets/star-solid-24.png";
    fav = !fav;
});

randomBtn.addEventListener("click", () => {
    generate(Math.floor(Math.random() * 649) + 1)
});


generate("eevee")
createFavs()
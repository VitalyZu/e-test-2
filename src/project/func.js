const categories = 'http://localhost:3000/GetCategories'
const merchants = 'http://localhost:3000/GetMerchants'
const restrictions = 'http://localhost:3000/GetCountriesRestrictions'
const currencies = 'http://localhost:3000/GetMerchantsCurrencies'
const games = 'http://localhost:3000/GetGames'

//HTML для общего числа запросов
let numberRequest = document.createElement('div')
document.body.append(numberRequest)
numberRequest.innerHTML = '0'
//HTML сначала был для отображения статуса, теперь отображает окончание загрузки
let status = document.createElement('div')
document.body.append(status)
status.innerHTML = ' '
//HTML для отображения процентов
let percent = document.createElement('div')
document.body.append(percent)
percent.innerHTML = '0'


let requestCounter = 0 // Общее число запросов (включая ошибки)
const pureRequestNumber = 55 // Всего должно быть запросов
let pureCounter = 0 // Успешные запросы

//Для всех полей, кроме игр
async function fetchData(url) {
    try {
        requestCounter++
        numberRequest.innerHTML = `number of requests: ${requestCounter}`
        let response = await fetch(url)
        if (response.status === 500) { throw new Error(`Error ${url} `) }
        let categories = await response.json()
        pureCounter++
        percent.innerHTML = `${pureCounter}/${pureRequestNumber}  ${(pureCounter / pureRequestNumber * 100).toFixed(0)}%`
        return categories
    } catch (e) {
        console.log(e)
        return fetchData(url)
    }
}

//Только для игр
async function fetchGames(start, limit) {
    let games = []
    let gamesCount = 0
    async function getGamesNumber() {
        try {
            requestCounter++
            numberRequest.innerHTML = `number of requests: ${requestCounter}`
            let gamesNumber = await fetch('http://localhost:3000/GetGamesCount')
            if (gamesNumber.status === 500) { throw new Error('Error get games number') }
            gamesCount = await gamesNumber.json()
            gamesCount = gamesCount.count
            pureCounter++
            percent.innerHTML = `${pureCounter}/${pureRequestNumber}  ${(pureCounter / pureRequestNumber * 100).toFixed(0)}%`
        } catch (e) {
            console.log(e)
            return getGamesNumber()
        }
    }
    await getGamesNumber()

    async function getGames(start, limit) {
        try {
            requestCounter++
            numberRequest.innerHTML = `number of requests: ${requestCounter}`
            let arr1 = await fetch(`http://localhost:3000/GetGames?start=${start}&limit=${limit}`)
            if (arr1.status === 500) { throw new Error(`Error get games at ${start}`) }
            pureCounter++
            percent.innerHTML = `${pureCounter}/${pureRequestNumber}  ${(pureCounter / pureRequestNumber * 100).toFixed(0)}%`
            let arr2 = await arr1.json()
            games = games.concat(arr2)
            if (games.length != gamesCount) {
                start += 50
                return getGames(start, limit)
            }
            else { return games }
        } catch (e) {
            console.log(e)
            return getGames(start, limit)
        }
    }
    await getGames(start, limit)
    return games
}

async function build() {
    /* // Сначала сделал последовательно
    status.innerHTML = `Categories recive ...`
    let param1 = await fetchData(categories).then(e => e)
    status.innerHTML = `Merchants recive ...`
    let param2 = [await fetchData(merchants).then(e => e)]
    status.innerHTML = `Restrictions recive ...`
    let param3 = [await fetchData(restrictions).then(e => e)]
    status.innerHTML = `Currencies recive ...`
    let param4 = await fetchData(currencies).then(e => e)
    status.innerHTML = `Games recive ...`
    let param5 = await fetchGames(0, 50)
    status.innerHTML = `Done!`
    status.classList.add('success') */

    let promo = [fetchData(categories),
    fetchData(merchants),
    fetchData(restrictions),
    fetchData(currencies),
    fetchGames(0, 50)]

    //Затем переделал в allSettled
    let data = []
    await Promise.allSettled(promo)
        .then(results => {
            results.forEach((result, num) => {
                if (result.status == "fulfilled") {
                    data.push(result.value)
                }
            })
        })
    status.innerHTML = `Done!`
    status.classList.add('success')
    let [param1, param2, param3, param4, param5] = data

    class Game {
        constructor(cat, merch, res, curr, game) {
            this.categories = cat,
                this.merchants = merch,
                this.restrictions = res,
                this.currencies = curr,
                this.games = game
        }
    }

    let merchObj = {} //Объект для таблиц
    let catObj = {}   //Объект для таблиц
    let tabMerch = document.createElement('table')
    let tabCat = document.createElement('table')
    document.body.append(tabMerch)
    document.body.append(tabCat)

    //Заполняем объект id c нулевыми значениями
    _.forEach(param1, function (value) {
        catObj[value.ID] = 0
    })

    //Игры по мерчам
    _.forEach(param5, function (value) {
        if (merchObj.hasOwnProperty(value.MerchantID)) {
            merchObj[value.MerchantID]++
        } else { merchObj[value.MerchantID] = 1 }
        _.forEach(value.CategoryID, function (value) {
            if (catObj.hasOwnProperty(value)) {
                catObj[value]++
            }
        })
    })

    //Таблица для игр по мерчам
    _.forEach(merchObj, function (value, key) {
        let tr = document.createElement('tr')
        let td1 = document.createElement('td')
        let td2 = document.createElement('td')
        td1.innerHTML = `<td>Merchant ID ${key}: </td>`
        td2.innerHTML = `<td> ${value} </td>`
        tr.appendChild(td1)
        tr.appendChild(td2)
        tabMerch.appendChild(tr)
    })

    //Таблица для игр по категориям
    _.forEach(catObj, function (value, key) {
        let tr = document.createElement('tr')
        let td1 = document.createElement('td')
        let td2 = document.createElement('td')
        _.forEach(param1, function (elem) {
            if (elem.ID === key) {
                td1.innerHTML = `<td>${elem.Trans.en}: </td>`
                td2.innerHTML = `<td> ${value} </td>`
            }
        })
        tr.appendChild(td1)
        tr.appendChild(td2)
        tabCat.appendChild(tr)
    })
}

build()


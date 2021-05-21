App = {
    loading: false,
    contracts: {},
  
    load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
      App.account = web3.eth.accounts[0]
      web3.eth.defaultAccount = web3.eth.accounts[0]
      console.log('Account used: '+App.account)
    },
  
    loadContract: async () => {
      // Create a JavaScript version of the smart contract
      // Escrow Contract
      const escrow = await $.getJSON('Escrow.json')
      App.contracts.Escrow = TruffleContract(escrow)
      App.contracts.Escrow.setProvider(App.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      App.escrow = await App.contracts.Escrow.deployed()
      console.log("Escrow SmartContract used: "+App.escrow.address)

      // MyToken Contract
      const myToken = await $.getJSON('MyToken.json')
      App.contracts.MyToken = TruffleContract(myToken)
      App.contracts.MyToken.setProvider(App.web3Provider)
  
      // Hydrate the smart contract with values from the blockchain
      App.myToken = await App.contracts.MyToken.deployed()
      console.log("MyToken SmartContract used: "+App.myToken.address)
    },
  
    render: async () => {
      // Prevent double render
      if (App.loading) {
        return
      }
  
      // Update app loading state
      App.setLoading(true)
  
      // Render Account
      $('#account').html(App.account)
      $('#escrowContract').html(App.escrow.address)
      $('#myTokenContract').html(App.myToken.address)
  
      // Render Orders
      await App.renderOrders()
  
      // Update loading state
      App.setLoading(false)
    },
  
    renderOrders: async () => {
      // Load the total order count from the blockchain
      const orderCount = await App.escrow.orderCount()
      const $orderTemplate = $('.orderTemplate')
  
      // Render out each task with a new task template
      for (var i = 1; i <= orderCount; i++) {
        // Fetch the task data from the blockchain
        const order = await App.escrow.orders(i)
        const orderId = order[0].toNumber()
        const sellerAddress = order[1]
        const buyerAddress = order[2]
        const quantity = order[3].toNumber()
        const settlementAmount = order[4].toNumber()
        const statusInt = order[5].toNumber()
        status = 'None'
        switch (statusInt) {
          case 0:
            status = 'Pending'
            break;
          case 1:
            status = 'Settled'
            break;
          case 2:
            status = 'Refused'
            break;
          case 3:
            status = 'Canceled'
            break;
        }

        // const taskAmount = web3.fromWei(task[3].toNumber(),'ether')
        console.log('orderId: '+orderId)
        console.log('buyerAddress: '+buyerAddress)
        console.log('sellerAddress: '+sellerAddress)
        console.log('quantity: '+quantity)
        console.log('settlementAmount: '+settlementAmount)
  
        // Create the html for the order
        const $newOrderTemplate = $orderTemplate.clone()
        $newOrderTemplate.find('.orderId').html(orderId)
        $newOrderTemplate.find('.quantity').html(quantity)
        $newOrderTemplate.find('.sellerAddress').html(sellerAddress)
        $newOrderTemplate.find('.buyerAddress').html(buyerAddress)
        $newOrderTemplate.find('.settlementAmount').html(settlementAmount)
        $newOrderTemplate.find('.status').html(status)
        $newOrderTemplate.find('.accept')
        .prop('orderId', orderId)
        .prop('settlementAmount', settlementAmount)
        .prop('buyerAddress', buyerAddress)
        .prop('sellerAddress', sellerAddress)
        .on('click', App.acceptOrder)
        $newOrderTemplate.find('.refuse')
        .prop('orderId', orderId)
        .prop('sellerAddress', sellerAddress)
        .on('click', App.refuseOrder)
        $newOrderTemplate.find('.cancel')
        .prop('orderId', orderId)
        .on('click', App.cancelOrder)
        
          $('#orderList').append($newOrderTemplate)
  
        // Show the orders
        $newOrderTemplate.show()
      }
    },
  
    createOrder: async () => {
      App.setLoading(true)
      const quantity = $('#quantity').val();
      const settlementAmount = $('#settlementAmount').val();
      const buyerAddress = $('#buyerAddress').val();

      // var etherAmount = web3.toBigNumber($("#paidAmount").val());
      // var weiValue = web3.toWei(etherAmount,'ether');
      await App.escrow.createOrder(buyerAddress, quantity, settlementAmount, {from: web3.eth.accounts[0]})
      window.location.reload()
    },
  
    acceptOrder: async (e) => {
      App.setLoading(true)
      const orderId = e.target.orderId
      const settlementAmount = e.target.settlementAmount
      const buyerAddress = e.target.buyerAddress
      const sellerAddress = e.target.sellerAddress
      var weiValue = web3.toWei(settlementAmount,'ether');
      console.log('orderId: '+orderId)
      console.log('settlementAmount: '+settlementAmount)
      console.log('buyerAddress: '+buyerAddress)
      console.log('sellerAddress: '+sellerAddress)
      await App.escrow.acceptOrder(orderId, sellerAddress, {from: web3.eth.accounts[0], value: weiValue})
      window.location.reload()
    },

    refuseOrder: async (e) => {
      App.setLoading(true)
      const orderId = e.target.orderId
      const sellerAddress = e.target.sellerAddress
      console.log('orderId: '+orderId)
      console.log('sellerAddress: '+sellerAddress)
      await App.escrow.refuseOrder(orderId, sellerAddress, {from: web3.eth.accounts[0]})
      window.location.reload()
    },

    cancelOrder: async (e) => {
      App.setLoading(true)
      const orderId = e.target.orderId
      console.log('orderId: '+orderId)
      await App.escrow.cancelOrder(orderId, {from: web3.eth.accounts[0]})
      window.location.reload()
    },
  
    setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
        loader.show()
        content.hide()
      } else {
        loader.hide()
        content.show()
      }
    }
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })
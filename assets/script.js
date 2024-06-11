document.addEventListener('DOMContentLoaded', function () {
    const users = [
        { username: 'Admin', password: '123', role: 'admin' },
        { username: 'Thiago', password: '123', role: 'user' },
    ];

    function salvarDados() {
        localStorage.setItem('catalogo', JSON.stringify(catalogo));
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
    }
    function get(id) {
        return document.getElementById(id);
    }

    let catalogo = JSON.parse(localStorage.getItem('catalogo')) || [];
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    let loggedUser = JSON.parse(localStorage.getItem('loggedUser')) || null;


    if (catalogo.length === 0 && get('noproducts')) {
        get('noproducts').classList.remove('escondido');
    } else {
        get('noproducts') && get('noproducts').classList.add('escondido');
    }

    if ((get('addProduct') && !loggedUser) || (get('addProduct') && loggedUser.role !== 'admin')) {
        Swal.fire({
            title: 'Opa...',
            text: `Você não tem permissão pra entrar aqui!`,
            icon: "error"
        }).then(() => {
            window.location.href = 'index.html'
        });
    }

    if (loggedUser) {
        get('cartlist') && get('cartlist').classList.remove('escondido');

        get('liCart') && get('liCart').classList.remove('escondido');
        if (get('username') && get('password')) {
            Swal.fire({
                title: 'Opa...',
                text: `Você já está autenticado! Saia para entrar novamente.`,
                icon: "error"
            }).then(() => {
                window.location.href = 'index.html'
            });
        }

        if (get('nocart') && carrinho.length === 0) {
            get('nocart').classList.remove('escondido');
            get('cartlist').classList.add('escondido');
        }

        document.getElementById('indexLoginButton') && document.getElementById('indexLoginButton').classList.add('escondido');
        document.getElementById('usernameIndex') && document.getElementById('usernameIndex').classList.remove('escondido');
        document.getElementById('exitButton') && document.getElementById('exitButton').classList.remove('escondido');
        if (document.getElementById('usernameIndex')) {
            document.getElementById('usernameIndex').innerText = loggedUser.username;
        }

        if (loggedUser.role === 'admin') {
            get('leftsideNavBar').innerHTML += `<li><a href="admin.html">Admin</a></li>`;
        }
    } else {
        get('liCart') && get('liCart').classList.add('escondido');
        if (get('nocart')) {
            Swal.fire({
                title: 'Opa...',
                text: `Você não está em sua conta, entre e tente novamente!`,
                icon: "error"
            }).then(() => {
                window.location.href = 'login.html'
            });
        }

        if (get('leftsideNavBar')) {
            get('leftsideNavBar').innerHTML = `<li><a href="index.html">Início</a></li>
                                                <li><a href="produtos.html">Produtos</a></li>
                                                <li><a href="carrinho.html">Carrinho</a></li>`;
        }

        get('indexLoginButton') && get('indexLoginButton').classList.remove('escondido');
        document.getElementById('indexLoginButton') && document.getElementById('usernameIndex').classList.add('escondido');
    }

    document.getElementById('exitButton')?.addEventListener('click', function () {
        loggedUser = null;
        localStorage.setItem('carrinho', null);
        localStorage.setItem('loggedUser', null);
        document.getElementById('usernameIndex') && document.getElementById('usernameIndex').classList.add('escondido');
        document.getElementById('exitButton') && document.getElementById('exitButton').classList.add('escondido');
        document.getElementById('indexLoginButton') && document.getElementById('indexLoginButton').classList.remove('escondido');
    });

    function atualizarCatalogo() {
        const catalogoProdutos = document.getElementById('products-grid');

        if (catalogoProdutos) {
            catalogo.forEach(produto => {
                const produtoC = document.createElement('a');
                produtoC.onclick = () => {
                    adicionarAoCarrinho(produto.id);
                }
                produtoC.className = `product-item`;
                produtoC.id = produto.id;
                produtoC.innerHTML = `<div class="add-cart">
                        <p>Adicionar ao carrinho</p>
                    </div>
                    <div class="photo">
                        <img src="${produto.imagem}" alt="${produto.nome}">
                    </div>
                    <div class="info">
                        <div class="product-name">${produto.nome}</div>
                        <div class="product-price">R$${produto.preco.toFixed(2)}</div>
                    </div>`;
                catalogoProdutos.appendChild(produtoC);
            });
        }
    }

    function removerCarrinho(id) {
        const produtoIndex = carrinho.findIndex(produto => produto.id === id);
        if (produtoIndex !== -1) {
            carrinho.splice(produtoIndex, 1);
            atualizarCarrinho();
            salvarDados();
            Swal.fire({
                title: 'Produto removido!',
                text: `O produto selecionado foi removido com sucesso!`,
                icon: "success"
            }).then((result) => {
                window.location.href = '';
            });;
        }
    }

    function validaFormPagamento() {
        let camposInvalidos = [];
        if (get('nameClient') && get('nameClient').value === '') {
            camposInvalidos.push('nome');
        }
        if (get('cpf') && get('cpf').value === '') {
            camposInvalidos.push('cpf');
        }
        if (get('endereco') && get('endereco').value === '') {
            camposInvalidos.push('endereço');
        }
        return camposInvalidos;
    }

    function atualizarCarrinho() {
        const carrinhoDiv = document.getElementById('cartlist');
        if (carrinhoDiv) {
            let total = 0;
            carrinho.forEach((item, idx) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cartitem';
                itemDiv.innerHTML += `<span>${item.nome} - R$ ${item.preco.toFixed(2)}</span>`;
                itemDiv.innerHTML += `<button id="removePro${idx}" onclick="removerCarrinho(${item.id})" class="deleteCart">Remover</button>`;
                carrinhoDiv.appendChild(itemDiv);
                total += item.preco;
            });
            carrinhoDiv.innerHTML += `<div class="division"></div>`;
            carrinhoDiv.innerHTML += `<div class="center">
                                            <label for="nameClient">Nome:</label>
                                            <input type="text" id="nameClient" required/>
                                            <label for="cpf">CPF:</label>
                                            <input type="number" id="cpf" required/>
                                            <label for="endereco">Endereço:</label>
                                            <input type="text" id="endereco" required/>
                                        </div>
                                        <div class="carttotal">
                                            <div class="totaltext">
                                                <h2>Total das compras: R$ ${total.toFixed(2)}</h2>
                                            </div>
                                            <div class="buycart">
                                                <button id="payment">Finalizar compra</button>
                                            </div>
                                        </div>`;
            document.getElementById('payment')?.addEventListener('click', function () {
                let camposInvalidos = validaFormPagamento();
                let textoMensagem = '';
                camposInvalidos.forEach((campos) => {
                    textoMensagem += `${campos}, `;
                });
                if (camposInvalidos.length > 0) {
                    Swal.fire({
                        title: 'Campos inválidos!',
                        text: `Por favor, verifique os seguintes campos: ${textoMensagem}`,
                        icon: "error"
                    }).then((result) => {
                        window.location.href = '';
                    });
                    return;
                }
                carrinhoDiv.innerHTML = ``;
                Swal.fire({
                    title: 'Compra finalizada!',
                    text: `Sua compra foi finalizada com sucesso!`,
                    icon: "success"
                }).then((result) => {
                    window.location.href = 'index.html';
                });
                carrinho = [];
                atualizarCarrinho();
                salvarDados();
            });
        }
    }

    function adicionarAoCarrinho(id) {
        if (!loggedUser) {
            Swal.fire({
                title: 'Erro!',
                text: `Você precisa estar autenticado para realizar esta ação!`,
                icon: "error"
            }).then(() => {
                window.location.href = ''
            });
            return;
        }
        const produto = catalogo.find(produto => produto.id === id);
        if (produto) {
            carrinho.push(produto);
            atualizarCarrinho();
            salvarDados();
            Swal.fire({
                title: 'Carrinho',
                text: `Produto adicionado ao carrinho com sucesso!`,
                icon: "success"
            }).then(() => {
                window.location.href = ''
            });
        }
    }

    document.getElementById('loginButton')?.addEventListener('click', function () {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (user) {
            loggedUser = user;
            salvarDados();
            if (loggedUser && loggedUser.role === 'admin') {
                atualizarAdminPanel();
            }
            Swal.fire({
                title: 'Bem-vindo.',
                text: `Obrigado por acessar ${user.username}! Boas compras`,
                icon: "success"
            }).then(() => {
                window.location.href = 'index.html'
            });
        } else {
            Swal.fire({
                title: 'Erro!',
                text: `Login ou senha inválidos.`,
                icon: "error"
            });;
        }
    });

    function atualizarAdminPanel() {
        const productListAdmin = document.getElementById('products-grid-adm');

        if (productListAdmin) {
            catalogo.forEach(produto => {
                const produtoA = document.createElement('a');
                produtoA.onclick = () => {
                    removerProduto(produto.id);
                }
                produtoA.className = `product-item`;
                produtoA.id = produto.id;
                produtoA.innerHTML = `<div class="delete-product">
                                        <p>Excluir</p>
                                        </div>
                                        <div class="photo">
                                            <img src="${produto.imagem}" alt="${produto.nome}">
                                        </div>
                                        <div class="info">
                                            <div class="product-name">${produto.nome}</div>
                                            <div class="product-price">R$${produto.preco.toFixed(2)}</div>
                                    </div>`;
                productListAdmin.appendChild(produtoA);
            });
        }
    }

    function removerProduto(id) {
        const produtoIndex = catalogo.findIndex(produto => produto.id === id);
        if (produtoIndex !== -1) {
            catalogo.splice(produtoIndex, 1);
            atualizarCatalogo();
            atualizarAdminPanel();
            salvarDados();
            Swal.fire({
                title: 'Produto removido!',
                text: `O produto selecionado foi removido com sucesso!`,
                icon: "success"
            }).then((result) => {
                window.location.href = '';
            });;
        }
    }

    function validarFormAdm() {
        let camposInvalidos = [];
        if (get('nameProduct') && get('nameProduct').value === '') {
            camposInvalidos.push('nome');
        }
        if (get('priceProduct') && get('priceProduct').value === '') {
            camposInvalidos.push('preço');
        }
        if (get('productPhotoLink') && get('productPhotoLink').value === '') {
            camposInvalidos.push('link da foto');
        }
        return camposInvalidos;
    }

    document.getElementById('addProduct')?.addEventListener('click', function () {
        let camposInvalidos = validarFormAdm();
        let textoMensagem = '';
        camposInvalidos.forEach((campos) => {
            textoMensagem += `${campos}, `;
        });
        if (camposInvalidos.length > 0) {
            Swal.fire({
                title: 'Campos inválidos!',
                text: `Por favor, verifique os seguintes campos: ${textoMensagem}`,
                icon: "error"
            }).then((result) => {
                window.location.href = '';
            });
            return;
        }
        const nome = document.getElementById('nameProduct').value;
        const preco = parseFloat(document.getElementById('priceProduct').value);
        const imagem = document.getElementById('productPhotoLink').value;
        const id = catalogo.length ? catalogo[catalogo.length - 1].id + 1 : 1;
        catalogo.push({ id, nome, preco, imagem });
        atualizarCatalogo();
        salvarDados();
        atualizarAdminPanel();
        Swal.fire({
            title: 'Produto adicionado ao carrinho!',
            text: `O produto adicionado ao carrinho com sucesso!`,
            icon: "success"
        }).then((result) => {
            window.location.href = '';
        });;
    });

    window.adicionarAoCarrinho = adicionarAoCarrinho;
    window.removerProduto = removerProduto;
    window.removerCarrinho = removerCarrinho;

    atualizarCatalogo();
    atualizarCarrinho();
    if (loggedUser) {
        if (loggedUser.role === 'admin') {
            atualizarAdminPanel();
        }
    }
});

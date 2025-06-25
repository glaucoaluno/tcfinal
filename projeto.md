pasta raiz
|index.html, script.js, styles.css
|--imagem
|--Cadastro para Doacao - cadastro.html, script.js, styles.css, cadastro.json
|
|--Administrativo -- Administrativo.html, script.js, styles.css, Administrativo.json - login
|		|--Familias Beneficiadas -- Familias.html, script.js, styles.css, Familias.json - acesso somente apos login
|		|--Registro de Doacoes  --  Registro.html, script.js, styles.css, Registro.json - acesso somente apos login
|		|--Relatorio de Distribuicao  -- Relatorio.html, script.js, styles.css, Relatorio.json - acesso somente apos login



Este projeto, é uma pagina para receber e destribuir doação de alimentos, o index é a pagina inicial nele tem dois botões 
<button id="donate-btn" class="btn">Quero Doar</button> <button id="admin-btn" class="btn secondary">Área Administrativa</button>, 
na opção de quero doar abre a opção de cadastro de doação aonde a pessoa efetua um breve cadastro para informar que deseja efetuar uma doação, nesse cadastro 

tem um  <div class="radio-group"> aone clica em pessoa fisica ou pessoa juridica, 
tem que ter um validador de cpf e cnpj, com mascara para colocar os pontos e traço automatico conforme forem sendo digitados, e também um localizador de cep e 
um unico imput editavel ira receber nome rua bairro e cidade apos a pesso digitar seu cep logo a baixo o campo para colocar o numero da residencia, 
uma opção de cadastrar o email e o numero de telefone, nela também tem a opção de 
'já sou cadastrado' aonde o doador clica e digita seu cpf ou cnpj localiza seu cadastro e efetua um nova doação, imput para *Produto Doado* *Quantidade* com <select id="quantity-unit" name="quantity-unit"> <option value="unidades">unidades</option> <option value="caixas">caixas</option> <option value="pacotes">pacotes</option> </select>,  *Peso*. 
os campos qauntidade e pesso não precisão ser obrigatorio preencher, é interesante ter uma opção aonde o doador ira marcar se ira levar a doação ou ira solicitar a retirada.
e todas as informações serem salvos no arquivo cadastro.json, com a hora e data da doação


a pasta Administrativo com os arquivos Administrativo.html, script.js, styles.css, Administrativo.json é responsavel por liberar o acesso para o controle das doações e 
das familias cadastradas para doação e os doadores, controlados por usuario 'admin' e senha 'admin123'
apos confirmação libera o acesso as pastas Familias Beneficiadas, Registro de Doacoes, Relatorio de Distribuicao, o acesso as html destas pastas so podem ser acessados 
apos a confirmação de login, 

a pasta Familias Beneficiadas com os arquivos Familias.html, script.js, styles.css, Familias.json - acesso somente apos login, nesta parte sera exibido no 
Familias.html um lista das familias cadastradas que são salvas em Familias.json, e duas opçõs uma de cadastrar familias,

com os imput Nome* CPF* Telefone* Endereço* Membros na Família*, e outro botão para selecionar familia para beneficiar familia, nesse botão ele exibe 'select' com as familias cadastradas no Familias.json, apos selecionar mostar os imputs Produto Doado* Data de Retirada*, para deixar registrado 
uma data pra familia retirar a doação também é importande ter uma opção para dar baixa apos a retirada, uma ideia é na lista que exibe a familia ja ter o 
botão 'beneficiar familia' e o botão 'confirmar doação' esse botão ao ser clicado pergunta se a doação foi retirada ou não.


a pasta Registro de Doacoes  com os arquivos  Registro.html, script.js, styles.css, Registro.json - acesso somente apos login, exibe todo o historico de doações 
recebidas pelos doadores salvos em Registro.json, essas informações ficam listadas na Registro.html com dois botões editar e excluir, esssa pagina tembem tema  opção de registar nova doação 
para registrar doações que são entregue diretamente para instituição.

a pasta Relatorio de Distribuicao  com os arquivos Relatorio.html, script.js, styles.css, Relatorio.json - acesso somente apos login, exibe todo o historico de doações feitas em uma lista salva em Relatorio.json, com osbotões editar ou excluir.
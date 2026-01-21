# Como Gerar o APK do PJ Manager Scoti

Este projeto utiliza o Expo e o React Native. Para gerar um APK instalável no Android, você tem duas opções principais:

## Opção 1: Usando EAS Build (Recomendado)

O EAS (Expo Application Services) é a maneira mais moderna de construir aplicativos Expo.

1.  **Instale o EAS CLI:**
    ```bash
    npm install -g eas-cli
    ```

2.  **Faça login na sua conta Expo:**
    ```bash
    eas login
    ```

3.  **Configure o projeto (se ainda não estiver):**
    ```bash
    eas build:configure
    ```

4.  **Gere o APK:**
    Para gerar um APK para testes (side-loading), execute:
    ```bash
    eas build -p android --profile preview
    ```
    *Isso irá gerar um APK que você pode baixar e instalar no seu dispositivo Android.*

## Opção 2: Build Local (Avançado)

Se você tiver o ambiente de desenvolvimento Android (Android Studio, SDK, JDK) configurado na sua máquina:

1.  **Gere as pastas nativas (Prebuild):**
    ```bash
    npx expo prebuild
    ```

2.  **Navegue para a pasta android:**
    ```bash
    cd android
    ```

3.  **Construa o APK:**
    ```bash
    ./gradlew assembleRelease
    ```

4.  **Localize o APK:**
    O APK gerado estará em: `android/app/build/outputs/apk/release/app-release.apk`

## Configurações do App

O aplicativo agora é configurável. Ao abrir o app pela primeira vez, você verá as regras padrões. Você pode:

*   **Alterar Nome e CNPJ:** Toque no texto do cabeçalho para editar.
*   **Adicionar Regras:** Clique em "+ Adicionar" para criar novos lembretes.
*   **Editar/Excluir Regras:** Use os ícones de lápis e lixeira em cada cartão de regra.
*   **Salvar:** Clique em "Salvar Dados" para persistir suas alterações.
*   **Ativar Monitoramento:** Clique em "Ativar Monitoramento" para agendar as notificações com base nas regras atuais.

**Nota:** Sempre que alterar as regras, lembre-se de clicar em "Salvar Dados" e depois desativar e reativar o monitoramento para que as novas regras entrem em vigor.

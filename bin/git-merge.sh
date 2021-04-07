#!/bin/bash
# Adicione um novo remote; pode chamá-lo de "oficial":
git remote add oficial https://github.com/netforceti/sdk-js.git

# Obtenha todos os branches deste novo remote,
# como o oficial/main por exemplo:

git fetch oficial

# Certifique-se de que você está no branch main:

git checkout main

# Se você não quiser reescrever o histórico do seu branch main
# (talvez porque alguém já o tenha clonado) então você deve
# substituir o último comando por um

git merge oficial/main

# No entanto, para fazer com que futuros pull requests fiquem o mais
# limpos possível, é uma boa ideia fazer o rebase.

# Se você fez o rebase do seu branch a partir de oficial/main, talvez
# você precise forçar um push para o seu próprio repositório do Github.
# Você pode fazer isso com:

git push -f origin main
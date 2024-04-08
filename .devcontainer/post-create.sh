#!/bin/zsh
echo 'complete -C /usr/local/bin/aws_completer aws' >> /home/node/.zshrc

source ~/.zshrc
omz theme set simple
omz plugin enable vi-mode

npm install
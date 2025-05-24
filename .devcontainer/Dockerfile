FROM node:20-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    zsh \
    sudo \
    curl \
    wget \
    unzip \
    vim \
    nano \
    htop \
    jq \
    netcat \
    iputils-ping \
    dnsutils \
    iptables \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Give node user sudo privileges
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Switch to node user
USER $USERNAME

# Set up shell
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install powerline10k theme
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/.oh-my-zsh/custom/themes/powerlevel10k

# Configure zsh
RUN echo 'ZSH_THEME="powerlevel10k/powerlevel10k"' >> ~/.zshrc \
    && echo 'POWERLEVEL9K_DISABLE_CONFIGURATION_WIZARD=true' >> ~/.zshrc \
    && echo 'POWERLEVEL9K_INSTANT_PROMPT=quiet' >> ~/.zshrc

# Set up bash history persistence
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
    && mkdir /commandhistory \
    && touch /commandhistory/.bash_history \
    && chown -R $USERNAME /commandhistory \
    && echo $SNIPPET >> "/home/$USERNAME/.bashrc"

# Set up zsh history persistence
RUN echo 'export HISTFILE=/commandhistory/.zsh_history' >> ~/.zshrc \
    && echo 'setopt SHARE_HISTORY' >> ~/.zshrc \
    && touch /commandhistory/.zsh_history \
    && chown $USERNAME /commandhistory/.zsh_history

# Install global npm packages
RUN npm install -g \
    @anthropic-ai/claude-code \
    firebase-tools \
    typescript \
    ts-node \
    eslint \
    prettier

# Set working directory
WORKDIR /workspace

# Copy firewall initialization script
COPY --chown=$USERNAME:$USERNAME init-firewall.sh /home/$USERNAME/.devcontainer/init-firewall.sh
RUN chmod +x /home/$USERNAME/.devcontainer/init-firewall.sh

# Set default shell to zsh
ENV SHELL=/bin/zsh

# Configure Claude Code for sandbox environment
ENV CLAUDE_SKIP_PERMISSIONS=true
ENV CLAUDE_SANDBOX_MODE=true

# Expose common development ports
EXPOSE 3000 4000 5000 5001 8080 9099

CMD ["/bin/zsh"]
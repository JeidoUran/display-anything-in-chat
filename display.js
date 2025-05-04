Hooks.on("getItemSheetHeaderButtons", (app, buttons) => {
  buttons.unshift({
    class: 'display-anything-in-chat',
    icon: 'fas fa-comment-dots',
    label: 'Display in Chat',
    onclick: () => displayInChat(app.item),
  });
});

Hooks.once("tidy5e-sheet.ready", (api) => {
  api.registerItemHeaderControls?.({
    controls: [
      {
        icon: "fas fa-comment-dots",
        label: game.i18n.localize("DND5E.DisplayCard"),
        async onClickAction() {
          const item = this.document;
          await displayInChat(item);
        }
      }
    ]
  });
});

async function displayInChat(item) {
  if (!item) return;

  if (typeof item.displayCard === "function" && item.parent) {
    item.displayCard();
  } else {

if (game.modules.get("essence-system")?.active) renderEssenceSlots(item);

let content = await renderTemplate("systems/dnd5e/templates/chat/item-card.hbs", {
  actor: null,
  tokenId: null,
  item: {
    _id: item.id,
    name: item.name,
    img: item.img,
    type: item.type,
    system: foundry.utils.deepClone(item.system),
    labels: item.labels ?? {},
    isOwned: false,
    hasAttack: false,
    hasDamage: false
  },
  data: await item.system.getCardData(),
});

if (game.modules.get("essence-system")?.active) {
  const totalSlots = item.getFlag("essence-system", "slots") ?? 0;
  const filledSlots = item.getFlag("essence-system", "filledSlots") ?? 0;

  if (totalSlots > 0) {
    const html = $($.parseHTML(content));
    const header = html.find(".card-header.description.collapsible");

    if (header.length && !html.find(".essence-slots-chatcard").length) {
      const container = $(`<div class="essence-slots-chatcard" style="display: flex; gap: 2px; margin: 0em 0 0.25em 0;"></div>`);

      for (let i = 0; i < totalSlots; i++) {
        const slot = $(`<span class="essence-slot" style="position: relative; width: 12px; height: 12px;"></span>`);

        game.tooltip.activate(slot[0]);

        const emptyImg = $('<img class="slot-empty">').attr("src", game.settings.get("essence-system", "empty-slot-image"));
        emptyImg.css({ position: "absolute", top: 0, left: 0, width: "12px", height: "12px" });
        slot.append(emptyImg);

        if (i < filledSlots) {
          const fullImg = $('<img class="slot-filled">').attr("src", game.settings.get("essence-system", "filled-slot-image"));
          fullImg.css({ position: "absolute", top: 0, left: 0, width: "12px", height: "12px" });
          if (game.settings.get("essence-system", "enableGlowEffect")) {
            slot.addClass("filled-glow");
          }
          slot.append(fullImg);
        }

        container.append(slot);
      }

      header.after(container);

      // Mettre à jour `content` avec le HTML modifié
      const wrapper = $("<div>").append(html);
      content = wrapper.html();
    }
  }
}

    const chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: content,
      speaker: {
        alias: game.user.name
      }
    };

    ChatMessage.create(chatData);
  }
}

function renderEssenceSlots() {

}
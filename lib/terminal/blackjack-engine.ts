import type { LineVariant } from "@/components/terminal/types";

type Card = { rank: string; suit: string; value: number };

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        rank,
        suit,
        value: rank === "A" ? 11 : ["J", "Q", "K"].includes(rank) ? 10 : parseInt(rank, 10),
      });
    }
  }
  return deck;
}

function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const formatCard = (card: Card) => `${card.rank}${card.suit}`;

function getHandValue(hand: Card[]): number {
  let value = hand.reduce((sum, c) => sum + c.value, 0);
  let aces = hand.filter((c) => c.rank === "A").length;
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}

const isBlackjack = (hand: Card[]) => hand.length === 2 && getHandValue(hand) === 21;

type BJState = {
  isActive: boolean;
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  dealerHole: Card | null;
  playerTurn: boolean;
  gameOver: boolean;
  result: string | null;
  wins: number;
  losses: number;
  ties: number;
};

const state: BJState = {
  isActive: false,
  deck: [],
  playerHand: [],
  dealerHand: [],
  dealerHole: null,
  playerTurn: false,
  gameOver: false,
  result: null,
  wins: 0,
  losses: 0,
  ties: 0,
};

function line(content: string, variant: LineVariant = "default") {
  return { content, variant };
}

function dealNewHand() {
  if (state.deck.length < 15) {
    state.deck = shuffle(createDeck());
  }
  state.playerHand = [];
  state.dealerHand = [];
  state.dealerHole = null;
  state.playerTurn = true;
  state.gameOver = false;
  state.result = null;

  state.playerHand.push(state.deck.pop()!);
  state.dealerHand.push(state.deck.pop()!);
  state.playerHand.push(state.deck.pop()!);
  state.dealerHole = state.deck.pop()!;
  state.dealerHand.push(state.dealerHole);
}

function resolveGame(): { lines: { content: string; variant: LineVariant }[] } {
  state.gameOver = true;
  state.playerTurn = false;

  const playerValue = getHandValue(state.playerHand);
  const playerBJ = isBlackjack(state.playerHand);
  const dealerBJ = isBlackjack(state.dealerHand);

  let result: "win" | "loss" | "tie";
  if (playerBJ && dealerBJ) {
    result = "tie";
  } else if (playerBJ) {
    result = "win";
  } else if (dealerBJ) {
    result = "loss";
  } else if (playerValue > 21) {
    result = "loss";
  } else {
    while (getHandValue(state.dealerHand) < 17) {
      state.dealerHand.push(state.deck.pop()!);
    }
    const finalDealer = getHandValue(state.dealerHand);
    if (finalDealer > 21) {
      result = "win";
    } else if (finalDealer > playerValue) {
      result = "loss";
    } else if (finalDealer < playerValue) {
      result = "win";
    } else {
      result = "tie";
    }
  }

  if (result === "win") state.wins++;
  else if (result === "loss") state.losses++;
  else state.ties++;

  state.result = result;
  const lines: { content: string; variant: LineVariant }[] = [
    line("Dealer: " + state.dealerHand.map(formatCard).join(" "), "dimmed"),
    line(`Dealer total: ${getHandValue(state.dealerHand)}`, "dimmed"),
    line("", "default"),
  ];
  if (result === "win") lines.push(line("You win.", "success"));
  else if (result === "loss") lines.push(line("You lose.", "error"));
  else lines.push(line("Push (tie).", "warning"));
  lines.push(line(`Score — W:${state.wins} L:${state.losses} T:${state.ties}`, "dimmed"));
  lines.push(line('Type "deal" for a new hand or "exit" to leave.', "default"));
  return { lines };
}

export function startBlackjack(): { lines: { content: string; variant: LineVariant }[] } {
  state.isActive = true;
  dealNewHand();

  const lines: { content: string; variant: LineVariant }[] = [
    line("Blackjack — dealer stands on 17.", "success"),
    line("", "default"),
    line("Your hand: " + state.playerHand.map(formatCard).join(" "), "lambda"),
    line(`Your total: ${getHandValue(state.playerHand)}`, "default"),
    line("Dealer shows: " + formatCard(state.dealerHand[0]) + " [hidden]", "dimmed"),
    line("", "default"),
  ];

  if (isBlackjack(state.playerHand)) {
    lines.push(line("Blackjack!", "success"));
    return { lines: [...lines, ...resolveGame().lines] };
  }

  lines.push(line('Commands: hit | stand | deal | exit | help', "dimmed"));
  return { lines };
}

export function handleBlackjackInput(raw: string): { lines: { content: string; variant: LineVariant }[]; exit?: boolean } {
  const cmd = raw.trim().toLowerCase();
  if (!state.isActive) {
    return { lines: [line("Game not active. Type blackjack to start.", "warning")] };
  }

  if (cmd === "exit" || cmd === "quit") {
    state.isActive = false;
    return { lines: [line("Left blackjack.", "dimmed")], exit: true };
  }

  if (cmd === "help" || cmd === "?") {
    return {
      lines: [
        line("hit — draw a card", "default"),
        line("stand — hold and resolve", "default"),
        line("deal — new hand (after round ends)", "default"),
        line("exit — leave game", "default"),
      ],
    };
  }

  if (state.gameOver) {
    if (cmd === "deal" || cmd === "new") {
      state.gameOver = false;
      dealNewHand();
      const lines: { content: string; variant: LineVariant }[] = [
        line("New hand.", "success"),
        line("", "default"),
        line("Your hand: " + state.playerHand.map(formatCard).join(" "), "lambda"),
        line(`Your total: ${getHandValue(state.playerHand)}`, "default"),
        line("Dealer shows: " + formatCard(state.dealerHand[0]) + " [hidden]", "dimmed"),
        line("", "default"),
      ];
      if (isBlackjack(state.playerHand)) {
        lines.push(line("Blackjack!", "success"));
        return { lines: [...lines, ...resolveGame().lines] };
      }
      lines.push(line('Commands: hit | stand | deal | exit | help', "dimmed"));
      return { lines };
    }
    return { lines: [line('Round over. Type "deal" or "exit".', "warning")] };
  }

  if (cmd === "hit" || cmd === "h") {
    state.playerHand.push(state.deck.pop()!);
    const v = getHandValue(state.playerHand);
    const lines: { content: string; variant: LineVariant }[] = [
      line("You draw: " + formatCard(state.playerHand[state.playerHand.length - 1]), "lambda"),
      line(`Your total: ${v}`, "default"),
    ];
    if (v > 21) {
      lines.push(line("Bust!", "error"));
      return { lines: [...lines, ...resolveGame().lines] };
    }
    return { lines };
  }

  if (cmd === "stand" || cmd === "s") {
    return resolveGame();
  }

  return { lines: [line("Unknown command. Try hit, stand, deal, exit.", "warning")] };
}

export function isBlackjackActive(): boolean {
  return state.isActive;
}

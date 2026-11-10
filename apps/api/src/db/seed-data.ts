/**
 * Demo data for Café Oeste
 */

export interface SeedModifierGroup {
  name: string;
  minSelect: number;
  maxSelect: number;
  modifiers: { name: string; priceCents: number }[];
}

export interface SeedProduct {
  name: string;
  description: string;
  priceCents: number;
  barcode?: string;
  modifierGroups?: SeedModifierGroup[];
}

export interface SeedCategory {
  name: string;
  products: SeedProduct[];
}

export const store = {
  name: 'Café Oeste',
  slug: 'cafe-oeste',
};

export const devices = [
  { name: 'Totem 1 - Entrada', kind: 'kiosk' },
  { name: 'Cozinha', kind: 'kds' },
  { name: 'Painel de senhas', kind: 'display' },
] as const;

const doneness: SeedModifierGroup = {
  name: 'Ponto da carne',
  minSelect: 1,
  maxSelect: 1,
  modifiers: [
    { name: 'Mal passado', priceCents: 0 },
    { name: 'Ao ponto', priceCents: 0 },
    { name: 'Bem passado', priceCents: 0 },
  ],
};

const burgerExtras: SeedModifierGroup = {
  name: 'Adicionais',
  minSelect: 0,
  maxSelect: 3,
  modifiers: [
    { name: 'Bacon', priceCents: 500 },
    { name: 'Queijo extra', priceCents: 400 },
    { name: 'Ovo', priceCents: 300 },
    { name: 'Cebola caramelizada', priceCents: 400 },
  ],
};

export const menu: SeedCategory[] = [
  {
    name: 'Lanches',
    products: [
      {
        name: 'X-Burger',
        description: 'Pão brioche, hambúrguer de 150 g, queijo prato e molho da casa.',
        priceCents: 2490,
        modifierGroups: [doneness, burgerExtras],
      },
      {
        name: 'X-Salada',
        description: 'Hambúrguer de 150 g, queijo, alface, tomate e maionese da casa.',
        priceCents: 2690,
        modifierGroups: [doneness, burgerExtras],
      },
      {
        name: 'X-Bacon',
        description: 'Hambúrguer de 150 g, queijo, bacon crocante e cebola roxa.',
        priceCents: 2990,
        modifierGroups: [doneness, burgerExtras],
      },
      {
        name: 'Frango Crocante',
        description: 'Sobrecoxa empanada, alface, picles e molho de mostarda e mel.',
        priceCents: 2790,
        modifierGroups: [burgerExtras],
      },
      {
        name: 'Veggie de Grão-de-Bico',
        description: 'Hambúrguer de grão-de-bico, rúcula, tomate e maionese de ervas.',
        priceCents: 2690,
      },
    ],
  },
  {
    name: 'Porções',
    products: [
      {
        name: 'Batata Frita',
        description: 'Batata palito com sal e páprica.',
        priceCents: 1690,
        modifierGroups: [
          {
            name: 'Tamanho',
            minSelect: 1,
            maxSelect: 1,
            modifiers: [
              { name: 'Média', priceCents: 0 },
              { name: 'Grande', priceCents: 600 },
            ],
          },
        ],
      },
      {
        name: 'Anéis de Cebola',
        description: 'Anéis de cebola empanados, com molho barbecue.',
        priceCents: 1890,
      },
      {
        name: 'Nuggets (10 unidades)',
        description: 'Nuggets de frango empanados.',
        priceCents: 1990,
        modifierGroups: [
          {
            name: 'Molhos',
            minSelect: 0,
            maxSelect: 2,
            modifiers: [
              { name: 'Barbecue', priceCents: 0 },
              { name: 'Mostarda e mel', priceCents: 0 },
              { name: 'Maionese da casa', priceCents: 0 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Bebidas',
    products: [
      {
        name: 'Refrigerante Lata 350 ml',
        description: 'Cola, guaraná ou laranja.',
        priceCents: 690,
        barcode: '2000000000015',
      },
      {
        name: 'Água Mineral 500 ml',
        description: 'Com ou sem gás.',
        priceCents: 450,
        barcode: '2000000000022',
      },
      {
        name: 'Suco de Laranja 400 ml',
        description: 'Natural, espremido na hora.',
        priceCents: 1090,
      },
      {
        name: 'Milkshake 400 ml',
        description: 'Feito com sorvete de creme.',
        priceCents: 1690,
        modifierGroups: [
          {
            name: 'Sabor',
            minSelect: 1,
            maxSelect: 1,
            modifiers: [
              { name: 'Chocolate', priceCents: 0 },
              { name: 'Morango', priceCents: 0 },
              { name: 'Baunilha', priceCents: 0 },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Sobremesas',
    products: [
      {
        name: 'Brownie',
        description: 'Brownie de chocolate meio amargo.',
        priceCents: 1290,
        modifierGroups: [
          {
            name: 'Acompanhamento',
            minSelect: 0,
            maxSelect: 1,
            modifiers: [{ name: 'Bola de sorvete', priceCents: 500 }],
          },
        ],
      },
      {
        name: 'Petit Gâteau',
        description: 'Bolinho de chocolate com recheio cremoso e sorvete de creme.',
        priceCents: 1890,
      },
      {
        name: 'Cookie',
        description: 'Cookie de gotas de chocolate, embalado.',
        priceCents: 790,
        barcode: '2000000000039',
      },
    ],
  },
];

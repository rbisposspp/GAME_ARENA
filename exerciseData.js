// exerciseData.js - Contém apenas os dados dos exercícios

const exerciseData = [
  // =============== SET 1 ===============
  {
    set: 1, // Identificador do Set
    exercises: [
      // --- Exercício 1A: Word Scramble (Set 1 data) ---
      {
        id: '1A',
        type: 'wordScramble',
        title: 'Set 1: Vocabulary: Word Scramble',
        instructions: 'Part A: Complete the words. Unscramble the words for things you might carry.',
        pointsPerCorrect: 2,
        words: [
          { scrambled: 'pohot', answer: 'photo', hint: 'Related to taking pictures.' },
          { scrambled: 'lelc hpone', answer: 'cell phone', hint: 'What do you use to call?' },
          { scrambled: 'DI dacr', answer: 'id card', hint: 'What you use to prove who you are?' },
          { scrambled: 'mabrellu', answer: 'umbrella', hint: 'What do you use when it rains?' },
          { scrambled: 'levogs', answer: 'gloves', hint: 'What do you use to keep your hands warm?' },
          { scrambled: 'wacht', answer: 'watch', hint: 'What do you use to see the time?' },
          { scrambled: 'cdteri dacr', answer: 'credit card', hint: 'What do you use to buy things?' },
          { scrambled: 'ltawel', answer: 'wallet', hint: 'Where do you put your money?' },
          { scrambled: 'agb', answer: 'bag', hint: 'Where do you put your things to carry?' }
        ]
      },
      // --- Exercício 2A: Tables (Set 1 data) ---
      {
        id: '2A_Plurals',
        type: 'tableFill',
        title: 'Set 1: Grammar: Plurals',
        instructions: 'Part A: Complete the tables. Fill in the missing words (Plurals Set 1).',
        pointsPerCorrect: 1,
        items: [
          { singular: 'boy', plural: 'boys' },
          { singular: null, plural: 'girls', answer: 'girl' },
          { singular: 'woman', plural: null, answer: 'women' },
          { singular: 'man', plural: null, answer: 'men' },
          { singular: null, plural: 'friends', answer: 'friend' },
          { singular: 'child', plural: null, answer: 'children' },
          { singular: 'person', plural: null, answer: 'people' }
        ]
      },
      {
        id: '2A_Possessives',
        type: 'tableFill',
        title: 'Set 1: Grammar: Possessives',
        instructions: 'Part A: Complete the tables. Fill in the missing words (Possessives).',
        pointsPerCorrect: 1,
        items: [
          { subject: 'I', possessive: 'my' },
          { subject: 'you', possessive: 'your' },
          { subject: 'he', possessive: 'his' },
          { subject: 'she', possessive: 'her' },
          { subject: 'it', possessive: null, answer: 'its' },
          { subject: null, possessive: 'our', answer: 'we' },
          { subject: 'you (plural)', possessive: null, answer: 'your' },
          { subject: 'they', possessive: null, answer: 'their' }
        ]
      },
      // --- Exercício 3C: Matching (Set 1 data) ---
      {
        id: '3C',
        type: 'matching',
        title: 'Set 1: Grammar: What is it/are they?',
        instructions: 'Part C: Matching. Match the questions to the answers (Set 1).',
        pointsPerCorrect: 1,
        questions: [
          { questionText: 'What is it?', answerMatch: 'b' },
          { questionText: 'What are they?', answerMatch: 'a' },
          { questionText: 'What is it?', answerMatch: 'c' },
          { questionText: 'What is it?', answerMatch: 'd' },
          { questionText: 'What are they?', answerMatch: 'e' },
          { questionText: 'What are they?', answerMatch: 'f' }
        ],
        answerOptions: [
          { id: 'a', text: "They're chairs." },
          { id: 'b', text: "It's a photo." },
          { id: 'c', text: "It's an ID card." },
          { id: 'd', text: "It's a door." },
          { id: 'e', text: "They're pens." },
          { id: 'f', text: "They're jackets." }
        ],
        hint: 'Think about singular (it is / it\'s) and plural (they are / they\'re) forms.'
      },

      // --- Exercício 3D: Grammar: Possessive 's (Family Tree - Team 1) ---
      // ***** MODIFIED FROM SENTENCE BUILDER TO FILL IN *****
      {
        id: '3D', // Mesmo ID, novo conteúdo
        type: 'fillIn', // Mudado de sentenceBuilder para fillIn
        title: 'Set 1: Grammar: Possessive \'s (Family Tree)',
        instructions: 'Part B: Look at the family tree image and complete the sentences using the possessive \'s.',
        pointsPerCorrect: 2,
        imageUrl: 'images/family_tree.jpeg', // Caminho para a imagem da árvore
        items: [
          // Pergunta 1 (dividida em duas lacunas)
          { questionText: "1. Sarah is ... wife.", answer: "James's", isSuffix: false },
          { questionText: "   She is ... grandmother.", answer: "Kayla's", isSuffix: false },
          // Pergunta 2 (dividida em três lacunas)
          { questionText: "2. Annie is ... sister.", answer: "Jeff's", isSuffix: false },
          { questionText: "   She is ... daughter.", answer: "James's", isSuffix: false }, // Baseado na interpretação do AK
          { questionText: "   She is also ... daughter.", answer: "Sarah's", isSuffix: false } // Baseado na interpretação do AK
        ],
        hint: "Use 's to show possession (e.g., James's)."
      },
      // ***** FIM DA MODIFICAÇÃO PARA 3D - SET 1 *****

      // --- Exercício 4A: Picture Dictionary (Set 1 data) ---
      {
        id: '4A',
        type: 'pictureDictionary',
        title: 'Set 1: Vocabulary: Picture Dictionary',
        instructions: 'Part A: Identify the objects. Identify the objects in the images (Set 1).',
        pointsPerCorrect: 3,
        items: [
          { imageUrl: 'images/photo.jpeg', answer: 'photo', placeholder: 'Object 1' },
          { imageUrl: 'images/cell_phone.jpeg', answer: 'cell phone', placeholder: 'Object 2' },
          { imageUrl: 'images/id_card.jpeg', answer: 'id card', placeholder: 'Object 3' },
          { imageUrl: 'images/umbrella.jpeg', answer: 'umbrella', placeholder: 'Object 4' },
          { imageUrl: 'images/gloves.jpeg', answer: 'gloves', placeholder: 'Object 5' },
          { imageUrl: 'images/watch.jpeg', answer: 'watch', placeholder: 'Object 6' },
          { imageUrl: 'images/credit_card.jpeg', answer: 'credit card', placeholder: 'Object 7' },
          { imageUrl: 'images/wallet.jpeg', answer: 'wallet', placeholder: 'Object 8' },
          { imageUrl: 'images/bag.jpeg', answer: 'bag', placeholder: 'Object 9' },
          { imageUrl: 'images/sunglasses.jpeg', answer: 'sunglasses', placeholder: 'Object 10' },
          { imageUrl: 'images/keychain.jpeg', answer: 'keychain', placeholder: 'Object 11' },
          { imageUrl: 'images/t_shirt.jpeg', answer: 't-shirt', placeholder: 'Object 12' }
        ],
        hint: 'Look carefully at each image!'
      },
      // --- Exercício 5A: Possessives Fill-in (Set 1 data) ---
      {
        id: '5A',
        type: 'fillIn',
        title: 'Set 1: Grammar: Possessives Fill-in',
        instructions: "Part A: Possessive Adjectives vs. Possessive 's. Fill in the blanks with the correct possessive form (Set 1).",
        pointsPerCorrect: 2,
        items: [
          { questionText: "1. That's ... laptop!", answer: 'my', isSuffix: false },
          { questionText: "2. Here's ... coffee, sir.", answer: 'your', isSuffix: false },
          { questionText: "3. What's ... name?", answer: 'your', isSuffix: false },
          { questionText: "4. Look at ... hat.", answer: 'her', isSuffix: false },
          { questionText: "5. ... children are cute!", answer: 'Their', isSuffix: false },
          { questionText: "6. This is ... house.", answer: 'his', isSuffix: false },
          { questionText: "7. That's ... toy (the dog's).", answer: 'its', isSuffix: false },
          { questionText: "8. ... car is great!", answer: 'Our', isSuffix: false },
          { questionText: "9. Carmen is Diego... sister.", answer: "'s", isSuffix: true }
        ],
        hint: "Choose between my, your, his, her, its, our, their, or 's."
      },
      // --- Exercício 6A: Opposites Matching (Set 1 data) ---
      {
        id: '6A',
        type: 'oppositesMatching',
        title: 'Set 1: Vocabulary: Opposites Matching',
        instructions: 'Part A: Opposites. Match the words with their opposites (Set 1).',
        pointsPerCorrect: 3,
        pairs: {
          'small': 'big',
          'fast': 'slow',
          'cheap': 'expensive',
          'new': 'old',
          'long': 'short',
          'bad': 'good',
          'tall': 'short'
        },
        hint: 'Click a word in the first column, then its opposite in the second column.'
      },
      // --- Exercício 7A: Verb Categories (Set 1 data) ---
      {
        id: '7A',
        type: 'dragDropCategorize',
        title: 'Set 1: Vocabulary: Verb Categories',
        instructions: 'Categorize Verbs. Drag the verbs to the correct category (Set 1).',
        pointsPerCorrect: 2,
        itemsToDrag: ['drink', 'eat', 'have', 'listen to', 'read', 'speak', 'want', 'watch'],
        categories: [
          { id: 'actions', name: 'Actions You Do', correctItems: ['drink', 'eat', 'read', 'speak', 'watch'] },
          { id: 'experiences', name: 'Things You Experience/Desire', correctItems: ['have', 'listen to', 'want'] }
        ],
        hint: 'Think about physical activity vs. internal states or senses.'
      }
    ]
  },

  // =============== SET 2 ===============
  {
    set: 2, // Identificador do Set
    exercises: [
      // --- Exercício 1A: Word Scramble (Set 2 data) ---
      {
        id: '1A',
        type: 'wordScramble',
        title: 'Set 2: Vocabulary: Word Scramble',
        instructions: 'Part A: Complete the words. Unscramble more words for things you might carry.',
        pointsPerCorrect: 2,
        words: [
          { scrambled: 'yeks', answer: 'keys', hint: 'Used to open doors.' },
          { scrambled: 'bmoc', answer: 'comb', hint: 'Used for your hair.' },
          { scrambled: 'ckans', answer: 'snack', hint: 'Something small to eat.' },
          { scrambled: 'orimrr', answer: 'mirror', hint: 'Used to see your reflection.' },
          { scrambled: 'ssuiet', answer: 'tissue', hint: 'Used when you sneeze.' },
          { scrambled: 'pilkcits', answer: 'lipstick', hint: 'Makeup for lips.' },
          { scrambled: 'etobookn', answer: 'notebook', hint: 'Used for writing notes.' },
          { scrambled: 'nep', answer: 'pen', hint: 'Used for writing.' },
          { scrambled: 'ssalgnuses', answer: 'sunglasses', hint: 'Used to protect eyes from the sun.' }
        ]
      },
       // --- Exercício 2A: Tables (Set 2 data) ---
      {
        id: '2A_Plurals',
        type: 'tableFill',
        title: 'Set 2: Grammar: Plurals',
        instructions: 'Part A: Complete the tables. Fill in the missing words (Plurals Set 2).',
        pointsPerCorrect: 1,
        items: [
          { singular: 'box', plural: null, answer: 'boxes' },
          { singular: null, plural: 'mice', answer: 'mouse' },
          { singular: 'goose', plural: null, answer: 'geese' },
          { singular: 'foot', plural: null, answer: 'feet' },
          { singular: null, plural: 'leaves', answer: 'leaf' },
          { singular: 'wife', plural: null, answer: 'wives' },
          { singular: 'bus', plural: null, answer: 'buses' }
        ]
      },
      {
        id: '2A_Possessives',
        type: 'tableFill',
        title: 'Set 2: Grammar: Possessives',
        instructions: 'Part A: Complete the tables. Fill in the missing words (Possessives).',
        pointsPerCorrect: 1,
        items: [
          { subject: 'I', possessive: 'my' },
          { subject: 'you', possessive: 'your' },
          { subject: 'he', possessive: 'his' },
          { subject: 'she', possessive: 'her' },
          { subject: 'it', possessive: null, answer: 'its' },
          { subject: null, possessive: 'our', answer: 'we' },
          { subject: 'you (plural)', possessive: null, answer: 'your' },
          { subject: 'they', possessive: null, answer: 'their' }
        ]
      },
      // --- Exercício 3C: Matching (Set 2 data) ---
       {
        id: '3C',
        type: 'matching',
        title: 'Set 2: Grammar: What is it/are they?',
        instructions: 'Part C: Matching. Match the questions to the answers (Set 2).',
        pointsPerCorrect: 1,
        questions: [
            { questionText: 'What are they?', answerMatch: 'e' },
            { questionText: 'What is it?', answerMatch: 'f' },
            { questionText: 'What are they?', answerMatch: 'a' },
            { questionText: 'What is it?', answerMatch: 'b' },
            { questionText: 'What are they?', answerMatch: 'c' },
            { questionText: 'What is it?', answerMatch: 'd' }
        ],
        answerOptions: [
            { id: 'a', text: "They're keys." },
            { id: 'b', text: "It's a book." },
            { id: 'c', text: "They're shoes." },
            { id: 'd', text: "It's a window." },
            { id: 'e', text: "They're apples." },
            { id: 'f', text: "It's a table." }
        ],
        hint: 'Think about singular (it is / it\'s) and plural (they are / they\'re) forms.'
      },

      // --- Exercício 3D: Grammar: Possessive 's (Family Tree - Team 2) ---
      // ***** MODIFIED FROM SENTENCE BUILDER TO FILL IN *****
       {
        id: '3D', // Mesmo ID, novo conteúdo
        type: 'fillIn', // Mudado de sentenceBuilder para fillIn
        title: 'Set 2: Grammar: Possessive \'s (Family Tree)',
        instructions: 'Part B: Look at the family tree image and complete the sentences using the possessive \'s.',
        pointsPerCorrect: 2,
        imageUrl: 'images/family_tree.jpeg', // Caminho para a imagem da árvore
        items: [
            // Pergunta 3 (dividida em quatro lacunas)
            { questionText: "3. Kayla is ... daughter.", answer: "Jeff's", isSuffix: false }, // Baseado na interpretação do AK
            { questionText: "   She is also ... daughter.", answer: "Carol's", isSuffix: false }, // Baseado na interpretação do AK
            { questionText: "   She is ... granddaughter.", answer: "James's", isSuffix: false }, // Baseado na interpretação do AK
            { questionText: "   She is also ... granddaughter.", answer: "Sarah's", isSuffix: false }, // Baseado na interpretação do AK
            // Pergunta 4 (dividida em três lacunas)
            { questionText: "4. Jeff is ... husband.", answer: "Carol's", isSuffix: false },
            { questionText: "   He is ... brother.", answer: "Annie's", isSuffix: false },
            { questionText: "   He is also ... father.", answer: "Kayla's", isSuffix: false }
        ],
        hint: "Use 's to show possession (e.g., Carol's)."
      },
      // ***** FIM DA MODIFICAÇÃO PARA 3D - SET 2 *****

      // --- Exercício 4A: Picture Dictionary (Set 2 data) ---
      {
        id: '4A',
        type: 'pictureDictionary',
        title: 'Set 2: Vocabulary: Picture Dictionary',
        instructions: 'Part A: Identify the objects. Identify the objects in the images (Set 2).',
        pointsPerCorrect: 3,
        items: [
          { imageUrl: 'images/book.jpeg', answer: 'book', placeholder: 'Item A' },
          { imageUrl: 'images/key.jpeg', answer: 'key', placeholder: 'Item B' },
          { imageUrl: 'images/chair.jpeg', answer: 'chair', placeholder: 'Item C' },
          { imageUrl: 'images/table.jpeg', answer: 'table', placeholder: 'Item D' },
          { imageUrl: 'images/pen.jpeg', answer: 'pen', placeholder: 'Item E' },
          { imageUrl: 'images/pencil.jpeg', answer: 'pencil', placeholder: 'Item F' },
          { imageUrl: 'images/door.jpeg', answer: 'door', placeholder: 'Item G' },
          { imageUrl: 'images/window.jpeg', answer: 'window', placeholder: 'Item H' },
          { imageUrl: 'images/lamp.jpeg', answer: 'lamp', placeholder: 'Item I' },
          { imageUrl: 'images/shoes.jpeg', answer: 'shoes', placeholder: 'Item J' },
          { imageUrl: 'images/hat.jpeg', answer: 'hat', placeholder: 'Item K' },
          { imageUrl: 'images/jacket.jpeg', answer: 'jacket', placeholder: 'Item L' }
        ],
        hint: 'Look carefully at each image!'
      },
      // --- Exercício 5A: Possessives Fill-in (Set 2 data) ---
       {
        id: '5A',
        type: 'fillIn',
        title: 'Set 2: Grammar: Possessives Fill-in',
        instructions: "Part A: Possessive Adjectives vs. Possessive 's. Fill in the blanks with the correct possessive form (Set 2).",
        pointsPerCorrect: 2,
        items: [
          { questionText: "1. This is ... bag.", answer: 'her', isSuffix: false },
          { questionText: "2. Where is ... phone?", answer: 'his', isSuffix: false },
          { questionText: "3. I like ... new shoes.", answer: 'your', isSuffix: false },
          { questionText: "4. ... dog is friendly.", answer: 'My', isSuffix: false },
          { questionText: "5. We finished ... homework.", answer: 'our', isSuffix: false },
          { questionText: "6. The cat licked ... paw.", answer: 'its', isSuffix: false },
          { questionText: "7. Are these ... keys?", answer: 'their', isSuffix: false },
          { questionText: "8. Lisa is Bart... sister.", answer: "'s", isSuffix: true },
          { questionText: "9. That is Mr. Smith... car.", answer: "'s", isSuffix: true }
        ],
        hint: "Choose between my, your, his, her, its, our, their, or 's."
      },
      // --- Exercício 6A: Opposites Matching (Set 2 data) ---
      {
        id: '6A',
        type: 'oppositesMatching',
        title: 'Set 2: Vocabulary: Opposites Matching',
        instructions: 'Part A: Opposites. Match the words with their opposites (Set 2).',
        pointsPerCorrect: 3,
        pairs: {
          'hot': 'cold',
          'happy': 'sad',
          'easy': 'difficult',
          'dark': 'light',
          'empty': 'full',
          'wet': 'dry',
          'young': 'old'
        },
        hint: 'Click a word in the first column, then its opposite in the second column.'
      },
       // --- Exercício 7A: Verb Categories (Set 2 data) ---
       {
        id: '7A',
        type: 'dragDropCategorize',
        title: 'Set 2: Vocabulary: Verb Categories',
        instructions: 'Categorize Verbs. Drag the verbs to the correct category (Set 2).',
        pointsPerCorrect: 2,
        itemsToDrag: ['run', 'sleep', 'think', 'see', 'write', 'need', 'play', 'feel'],
        categories: [
          { id: 'actions', name: 'Actions You Do', correctItems: ['run', 'sleep', 'write', 'play'] },
          { id: 'experiences', name: 'Things You Experience/Desire', correctItems: ['think', 'see', 'need', 'feel'] }
        ],
        hint: 'Think about physical activity vs. internal states or senses.'
      }
    ]
  }
];

// Opcional: Apenas para depuração durante o desenvolvimento
// Certifique-se de que este console.log não cause erro se 'exerciseData' for grande
try {
  console.log('exerciseData loaded. Number of Sets:', exerciseData.length);
  if (exerciseData.length > 0) {
      console.log('Number of exercises in Set 1:', exerciseData[0].exercises.length);
      const ex3D_Set1 = exerciseData[0].exercises.find(ex => ex.id === '3D');
      if(ex3D_Set1) console.log('Set 1 - Exercise 3D type:', ex3D_Set1.type, 'imageUrl:', ex3D_Set1.imageUrl);
  }
   if (exerciseData.length > 1) {
      console.log('Number of exercises in Set 2:', exerciseData[1].exercises.length);
      const ex3D_Set2 = exerciseData[1].exercises.find(ex => ex.id === '3D');
      if(ex3D_Set2) console.log('Set 2 - Exercise 3D type:', ex3D_Set2.type, 'imageUrl:', ex3D_Set2.imageUrl);
  }
  const picDict1 = exerciseData[0].exercises.find(ex => ex.id === '4A');
  if (picDict1 && picDict1.items[0].imageUrl) {
      console.log('Set 1 Picture Dictionary using imageUrl:', picDict1.items[0].imageUrl);
  } else {
       console.log('Set 1 Picture Dictionary format check failed or not using imageUrl.');
  }
   const picDict2 = exerciseData[1].exercises.find(ex => ex.id === '4A');
  if (picDict2 && picDict2.items[0].imageUrl) {
      console.log('Set 2 Picture Dictionary using imageUrl:', picDict2.items[0].imageUrl);
  } else {
       console.log('Set 2 Picture Dictionary format check failed or not using imageUrl.');
  }

} catch (e) {
    console.error("Error logging exerciseData:", e);
}
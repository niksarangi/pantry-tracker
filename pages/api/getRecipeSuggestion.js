// pages/api/getRecipeSuggestion.js

export default async function handler(req, res) {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (req.method === 'POST') {
        const { inventoryItems } = req.body;

        if (!Array.isArray(inventoryItems)) {
            return res.status(400).json({ error: 'Invalid payload format' });
        }

        try {
            // Make a request to the external API with the provided inventoryItems
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-3.1-8b-instruct:free',
                    messages: [
                        { role: 'user', content: 'Suggest Recipes' },
                        ...inventoryItems.map(item => ({ role: 'user', content: item }))
                    ],
                }),
            });

            if (!response.ok) {
                return res.status(response.status).json({ error: await response.text() });
            }

            const data = await response.json();

            const suggestions = generateRecipeSuggestions(data);
            return res.status(200).json({ suggestions });

        } catch (error) {
            console.error('Error fetching recipe suggestions:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

function generateRecipeSuggestions(apiResponse) {
    return apiResponse.choices.map(choice => choice.message?.content || 'No suggestion');
}

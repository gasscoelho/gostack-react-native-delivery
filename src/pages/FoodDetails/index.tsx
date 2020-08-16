import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  thumbnail_url: string;
  formattedPrice: string;
  extras: Extra[];
  category: number;
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      // Load a specific food with extras based on routeParams id
      api.get(`/foods/${routeParams.id}`).then(response => {
        setFood(response.data);
        const foodExtras = response.data.extras.map(extra => {
          return {
            ...extra,
            quantity: 0,
          };
        });

        setExtras(foodExtras);

        api.get(`/favorites`).then(res => {
          const isFoodFavorite = res.data.find(
            fav => fav.id === routeParams.id,
          );
          setIsFavorite(isFoodFavorite);
        });
      });
    }

    loadFood();
  }, [routeParams]);

  function handleIncrementExtra(id: number): void {
    // Increment extra quantity
    const extraIndex = extras.findIndex(extra => extra.id === id);

    const updatedExtra = [...extras];

    updatedExtra[extraIndex].quantity += 1;

    setExtras(updatedExtra);
  }

  function handleDecrementExtra(id: number): void {
    // Decrement extra quantity
    const extraIndex = extras.findIndex(extra => extra.id === id);

    const updatedExtra = [...extras];

    if (updatedExtra[extraIndex].quantity === 0) {
      return;
    }

    updatedExtra[extraIndex].quantity -= 1;
    setExtras(updatedExtra);
  }

  function handleIncrementFood(): void {
    // Increment food quantity
    setFoodQuantity(state => state + 1);
  }

  function handleDecrementFood(): void {
    // Decrement food quantity
    if (foodQuantity === 1) {
      return;
    }
    setFoodQuantity(state => state - 1);
  }

  const toggleFavorite = useCallback(() => {
    // Toggle if food is favorite or not
    const favorite = food;
    delete favorite.extras;

    if (!isFavorite) {
      api.post(`/favorites`, favorite);
      setIsFavorite(true);
    } else {
      api.delete(`/favorites/${routeParams.id}`);
      setIsFavorite(false);
    }
  }, [isFavorite, food, routeParams.id]);

  const cartTotal = useMemo(() => {
    const additional =
      extras
        .map(extra => {
          return extra.quantity * extra.value;
        })
        .reduce((prev, curr) => prev + curr, 0) * foodQuantity;

    return food.price * foodQuantity + additional;

    // Calculate cartTotal
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    // Finish the order and save on the API
    /*
    {
      "id": 1,
      "product_id": 1,
      "name": "Ao molho",
      "description": "Macarrão ao molho branco, fughi e cheiro verde das montanhas.",
      "price": 19.9,
      "category": 1,
      "thumbnail_url": "https://storage.googleapis.com/golden-wind/bootcamp-gostack/desafio-gorestaurant-mobile/ao_molho.png",
      "extras": [
        {
          "id": 4,
          "name": "Bacon",
          "value": 1.5,
          "quantity": 1
        }
      ]
    }
    */
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">
              {`${formatValue(cartTotal)}`}
            </TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;

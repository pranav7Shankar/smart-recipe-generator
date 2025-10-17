import { ChefHat } from 'lucide-react';
const Header = () => {
  return (
    <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <ChefHat className="w-10 h-10 text-orange-600" />
            Smart Recipe Generator
          </h1>
          <p className="text-gray-600">Upload ingredient photos or enter them manually</p>
    </div>
  )
}

export default Header

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Support
from .serializers import SupportSerializer

@api_view(['POST', 'GET', 'DELETE'])
def support_list(request):
    if request.method == 'POST':
        serializer = SupportSerializer(data=request.data)
        if serializer.is_valid():
            support = Support.objects.get(url=request.data.url);
            # if support:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        supports = Support.objects.all()
        serializer = SupportSerializer(supports, many=True)
        return Response(serializer.data)

@api_view(['GET', 'DELETE'])
def support_detail(request, pk):
    try:
        support = Support.objects.get(pk=pk)
    except Support.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = SupportSerializer(support)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        support.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
